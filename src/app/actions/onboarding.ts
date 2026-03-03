"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type OnboardingCategory = {
    id: string
    name: string
    icon: string
    slug: string
}

export type PricingTier = "autonomous" | "standard" | "premium"

const PRICING_MULTIPLIERS = {
    autonomous: 0.8, // 20% discount
    standard: 1.0,   // Base price
    premium: 1.5     // 50% markup
}

export async function getOnboardingCategories(): Promise<OnboardingCategory[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from("template_categories")
        .select("*")
        .order("name")

    if (error) {
        console.error("Error fetching categories:", error)
        return []
    }

    return data
}

import { z } from "zod"

const OnboardingSchema = z.object({
    categoryId: z.string().min(1),
    specialties: z.array(z.string()),
    pricingTier: z.enum(["autonomous", "standard", "premium"]),
    businessProfile: z.object({
        businessName: z.string().optional(),
        phone: z.string().optional(),
        documentType: z.enum(["cpf", "cnpj"]).optional(),
        document: z.string().optional(),
        email: z.string().optional(),
        logoUrl: z.string().nullable().optional()
    }).optional()
})

export async function applyOnboardingKit(
    categoryId: string,
    specialties: string[],
    pricingTier: PricingTier,
    businessProfile?: { businessName?: string; phone?: string; documentType?: "cpf" | "cnpj"; document?: string; email?: string; logoUrl?: string | null }
) {
    const supabase = await createClient()


    // Securely get user ID from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, error: "Unauthorized" }
    }
    const userId = user.id

    // Validate Input
    const result = OnboardingSchema.safeParse({ categoryId, specialties, pricingTier, businessProfile })
    if (!result.success) {
        return { success: false, error: "Invalid input data" }
    }

    const multiplier = PRICING_MULTIPLIERS[pricingTier] || 1.0

    try {
        // 1. Fetch the user's organization_id (required by RLS policy on services table)
        let { data: memberData, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', userId)
            .limit(1)
            .single()

        // Fallback: create organization if trigger didn't fire (e.g. old accounts)
        if (memberError || !memberData?.organization_id) {
            console.warn('No organization found for user, creating one as fallback...')

            const { data: newOrg, error: orgCreateError } = await supabase
                .from('organizations')
                .insert({ name: businessProfile?.businessName || 'Meu Workspace' })
                .select('id')
                .single()

            if (orgCreateError || !newOrg) {
                throw new Error('Falha ao criar organização: ' + (orgCreateError?.message || 'erro desconhecido'))
            }

            const { error: memberInsertError } = await supabase
                .from('organization_members')
                .insert({ user_id: userId, organization_id: newOrg.id })

            if (memberInsertError) {
                throw new Error('Falha ao vincular organização: ' + memberInsertError.message)
            }

            memberData = { organization_id: newOrg.id }
        }

        const organizationId = memberData.organization_id

        // 2. Fetch Template Services
        const { data: services, error: servicesError } = await supabase
            .from("template_services")
            .select("*")
            .eq("category_id", categoryId)

        if (servicesError) throw servicesError

        // 3. Fetch Template Products
        const { data: products, error: productsError } = await supabase
            .from("template_products")
            .select("*")
            .eq("category_id", categoryId)

        if (productsError) throw productsError

        // 4. Prepare Bulk Inserts
        const relevantServices = services.filter(s =>
            s.specialty_tags && s.specialty_tags.some((tag: string) => specialties.includes(tag))
        )

        const relevantProducts = products.filter(p =>
            p.specialty_tags && p.specialty_tags.some((tag: string) => specialties.includes(tag))
        )

        // organization_id is required by the RLS policy "Users can insert own services"
        // which checks user_in_organization(organization_id)
        const allItems = [
            ...relevantServices.map(s => ({
                user_id: userId,
                organization_id: organizationId,
                description: s.name,
                default_price: Math.round(s.default_price * multiplier),
                details: s.description || null,
                type: 'service'
            })),
            ...relevantProducts.map(p => ({
                user_id: userId,
                organization_id: organizationId,
                description: p.name,
                default_price: Math.round(p.default_price * multiplier),
                details: p.description || null,
                type: 'product'
            }))
        ]

        // Deduplicate items by description
        const uniqueItemsMap = new Map();
        allItems.forEach(item => {
            if (!uniqueItemsMap.has(item.description)) {
                uniqueItemsMap.set(item.description, item);
            }
        });

        const itemsToInsert = Array.from(uniqueItemsMap.values());

        // 5. Execute Inserts
        if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from("services")
                .insert(itemsToInsert)

            if (insertError) throw insertError
        }

        // 5. Mark user as onboarded (upsert to handle missing profiles)
        console.log('Marking user as onboarded:', userId)

        // First, ensure profile exists (fallback in case trigger didn't fire)
        const profileDataToUpsert: any = {
            id: userId,
            onboarded_at: new Date().toISOString()
        };

        if (businessProfile) {
            if (businessProfile.businessName) profileDataToUpsert.business_name = businessProfile.businessName;
            if (businessProfile.phone) profileDataToUpsert.phone = businessProfile.phone;
            if (businessProfile.document) profileDataToUpsert.cnpj = businessProfile.document; // Still maps to profile cnpj (legacy) 
            if (businessProfile.email) profileDataToUpsert.email = businessProfile.email;
            if (businessProfile.logoUrl) profileDataToUpsert.logo_url = businessProfile.logoUrl;
        }

        const { error: upsertError } = await supabase
            .from("profiles")
            .upsert(profileDataToUpsert, {
                onConflict: 'id'
            })

        if (upsertError) {
            console.error('Failed to upsert profile:', upsertError)
            throw upsertError
        }

        // 6. Update Primary Organization automatically created by trigger
        if (businessProfile) {
            const { data: orgData } = await supabase
                .from('organization_members')
                .select('organization_id')
                .eq('user_id', userId)
                .limit(1)
                .single()

            if (orgData?.organization_id) {
                await supabase.from('organizations').update({
                    name: businessProfile.businessName || 'Meu Workspace',
                    document_type: businessProfile.documentType || 'cpf',
                    document: businessProfile.document || null,
                    logo_url: businessProfile.logoUrl || null
                }).eq('id', orgData.organization_id)
            }
        }

        console.log('Successfully applied onboarding kit and updated profile/org.')

        revalidatePath('/', 'layout')
        revalidatePath('/dashboard')
        revalidatePath('/onboarding')

        return { success: true }

    } catch (error) {
        console.error("Error applying onboarding kit:", error)
        // Return a serializable error message (Error objects become {} when passed through Server Actions)
        const message = error instanceof Error ? error.message : JSON.stringify(error)
        return { success: false, error: message }
    }
}
