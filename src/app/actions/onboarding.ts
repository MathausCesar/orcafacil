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
        cnpj: z.string().optional(),
        email: z.string().optional(),
        logoUrl: z.string().nullable().optional()
    }).optional()
})

export async function applyOnboardingKit(
    categoryId: string,
    specialties: string[],
    pricingTier: PricingTier,
    businessProfile?: { businessName?: string; phone?: string; cnpj?: string; email?: string; logoUrl?: string | null }
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
        // 1. Fetch Template Services
        // We want services that match the category AND have at least one of the selected specialties (or are generic)
        const { data: services, error: servicesError } = await supabase
            .from("template_services")
            .select("*")
            .eq("category_id", categoryId)
        // Filter logic would ideally be here, but for simplicity we fetch category and filter in JS if needed
        // or use the array overlap operator if available

        if (servicesError) throw servicesError

        // 2. Fetch Template Products
        const { data: products, error: productsError } = await supabase
            .from("template_products")
            .select("*")
            .eq("category_id", categoryId)

        if (productsError) throw productsError

        // 3. Prepare Bulk Inserts
        // Filter items based on specialties overlap
        const relevantServices = services.filter(s =>
            s.specialty_tags && s.specialty_tags.some((tag: string) => specialties.includes(tag))
        )

        const relevantProducts = products.filter(p =>
            p.specialty_tags && p.specialty_tags.some((tag: string) => specialties.includes(tag))
        )

        // Combine both into 'services' table (acting as generic catalog)
        // Schema: user_id, description, default_price, details, type
        const allItems = [
            ...relevantServices.map(s => ({
                user_id: userId,
                description: s.name, // Map name to description
                default_price: Math.round(s.default_price * multiplier),
                details: s.description || null,
                type: 'service'
            })),
            ...relevantProducts.map(p => ({
                user_id: userId,
                description: p.name, // Map name to description
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

        // 4. Execute Inserts
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
            if (businessProfile.cnpj) profileDataToUpsert.cnpj = businessProfile.cnpj;
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

        console.log('Successfully applied onboarding kit and updated profile.')

        revalidatePath('/', 'layout')
        revalidatePath('/dashboard')
        revalidatePath('/onboarding')

        return { success: true }

    } catch (error) {
        console.error("Error applying onboarding kit:", error)
        return { success: false, error }
    }
}
