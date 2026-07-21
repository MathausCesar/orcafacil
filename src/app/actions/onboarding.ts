"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database, Json } from "@/types/database.types"
import { getAppBaseUrl } from "@/lib/app-url"
import { getResend } from "@/lib/resend"
import { ZaclyEmailTemplate } from "@/components/emails/zacly-email-template"
import {
    buildProfileActivationFields,
    normalizeActivationIntent,
    type ActivationIntent,
} from "@/lib/activation-intent"
import {
    getDefaultProfessionalContext,
    getInitialCatalogForOnboarding,
    getRecommendedProposalModelForOnboarding,
    normalizeCatalogItemName,
    type OnboardingPricingTier,
} from "@/lib/onboarding-catalog"

export type OnboardingCategory = {
    id: string
    name: string
    icon: string
    slug: string
}

export type PricingTier = OnboardingPricingTier

const PRICING_MULTIPLIERS = {
    autonomous: 0.8, // 20% discount
    standard: 1.0,   // Base price
    premium: 1.5     // 50% markup
}

type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ServiceInsert = Database['public']['Tables']['services']['Insert']

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
        businessName: z.string().trim().min(1).optional(),
        phone: z.string().optional(),
        documentType: z.enum(["cpf", "cnpj"]).optional(),
        document: z.string().optional(),
        email: z.string().optional(),
        logoUrl: z.string().nullable().optional(),
        themeColor: z.string().nullable().optional(),
    }).optional(),
    activationIntent: z.unknown().optional(),
})

type JsonObject = { [key: string]: Json | undefined }

function parseQuoteSettings(value: unknown): JsonObject {
    if (!value) return {}

    try {
        if (typeof value === 'string') {
            const parsed = JSON.parse(value)
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                ? parsed as JsonObject
                : {}
        }

        return typeof value === 'object' && !Array.isArray(value)
            ? value as JsonObject
            : {}
    } catch {
        return {}
    }
}

export async function applyOnboardingKit(
    categoryId: string,
    specialties: string[],
    pricingTier: PricingTier,
    businessProfile?: { businessName?: string; phone?: string; documentType?: "cpf" | "cnpj"; document?: string; email?: string; logoUrl?: string | null; themeColor?: string | null },
    activationIntent?: ActivationIntent,
) {
    const supabase = await createClient()


    // Securely get user ID from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, error: "Unauthorized" }
    }
    const userId = user.id

    // Validate Input
    const result = OnboardingSchema.safeParse({ categoryId, specialties, pricingTier, businessProfile, activationIntent })
    if (!result.success) {
        return { success: false, error: "Invalid input data" }
    }

    const businessName = businessProfile?.businessName?.trim()
    if (businessProfile && !businessName) {
        return { success: false, error: "Informe seu nome ou o nome do negocio." }
    }

    const multiplier = PRICING_MULTIPLIERS[pricingTier] || 1.0
    const normalizedIntent = normalizeActivationIntent(activationIntent)

    try {
        // 1. Fetch the user's organization_id (required by RLS policy on services table)
        const { data: initialMemberData, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', userId)
            .limit(1)
            .single()

        let memberData = initialMemberData

        // Fallback: create organization if trigger didn't fire (e.g. old accounts)
        if (memberError || !memberData?.organization_id) {
            console.warn('No organization found for user, creating one as fallback...')

            const { data: newOrg, error: orgCreateError } = await supabase
                .from('organizations')
                .insert({ name: businessName || 'Meu Workspace' })
                .select('id')
                .single()

            if (orgCreateError || !newOrg) {
                throw new Error('Falha ao criar organizacao: ' + (orgCreateError?.message || 'erro desconhecido'))
            }

            const { error: memberInsertError } = await supabase
                .from('organization_members')
                .insert({ user_id: userId, organization_id: newOrg.id, role: 'owner' })

            if (memberInsertError) {
                throw new Error('Falha ao vincular organizacao: ' + memberInsertError.message)
            }

            memberData = { organization_id: newOrg.id }
        }

        const organizationId = memberData.organization_id

        const { data: category, error: categoryError } = await supabase
            .from("template_categories")
            .select("id, name, slug")
            .eq("id", categoryId)
            .single()

        if (categoryError || !category) {
            throw new Error('Categoria de onboarding nao encontrada.')
        }

        const professionalContext = getDefaultProfessionalContext(category.slug, specialties)
        const recommendedLayout = getRecommendedProposalModelForOnboarding(category.slug, specialties)

        // 2. Prepare a curated catalog for the selected trade.
        // This avoids broad category templates creating duplicated or incoherent items.
        const initialCatalog = getInitialCatalogForOnboarding(category.slug, specialties)

        // organization_id is required by the RLS policy "Users can insert own services"
        // which checks user_in_organization(organization_id)
        const itemsToInsert: ServiceInsert[] = initialCatalog.map(item => ({
                user_id: userId,
                organization_id: organizationId,
                description: item.name,
                default_price: Math.round(item.price * multiplier),
                details: item.details || null,
                type: item.type,
                unit: item.unit,
                category: category.name,
                stock_quantity: 0,
                min_stock: 0,
                track_stock: false,
            }))

        const { data: existingItems, error: existingItemsError } = await supabase
            .from("services")
            .select("description")
            .eq("organization_id", organizationId)

        if (existingItemsError) throw existingItemsError

        const existingDescriptions = new Set(
            (existingItems || []).map(item => normalizeCatalogItemName(item.description))
        )
        const newItemsToInsert = itemsToInsert.filter(item => {
            return !existingDescriptions.has(normalizeCatalogItemName(item.description))
        })

        // 3. Execute Inserts
        if (newItemsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from("services")
                .insert(newItemsToInsert)

            if (insertError) throw insertError
        }

        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("quote_settings, onboarded_at, email, business_name, intended_plan, first_attribution")
            .eq("id", userId)
            .maybeSingle()

        const isFirstOnboarding = !existingProfile?.onboarded_at

        const quoteSettings: Json = {
            ...parseQuoteSettings(existingProfile?.quote_settings),
            onboarding: {
                categoryId: category.id,
                categorySlug: category.slug,
                categoryName: category.name,
                specialties,
                pricingTier,
                professionalContext,
                recommendedLayout: recommendedLayout.model,
                recommendedLayoutReason: recommendedLayout.reason,
                completedAt: new Date().toISOString(),
            },
            activation: {
                intendedPlan: normalizedIntent.intendedPlan,
                attribution: normalizedIntent.attribution,
            },
        }

        // 5. Mark user as onboarded (upsert to handle missing profiles)
        console.log('Marking user as onboarded:', userId)

        // First, ensure profile exists (fallback in case trigger didn't fire)
        const profileDataToUpsert: ProfileInsert = {
            id: userId,
            onboarded_at: new Date().toISOString(),
            quote_settings: quoteSettings,
            ...buildProfileActivationFields(normalizedIntent, existingProfile?.first_attribution),
        };

        if (businessProfile) {
            if (businessName) profileDataToUpsert.business_name = businessName;
            if (businessProfile.phone) profileDataToUpsert.phone = businessProfile.phone;
            if (businessProfile.document) profileDataToUpsert.cnpj = businessProfile.document;
            if (businessProfile.email) profileDataToUpsert.email = businessProfile.email;
            if (businessProfile.logoUrl) profileDataToUpsert.logo_url = businessProfile.logoUrl;
            // Save theme color extracted from logo to personalize quote appearance
            if (businessProfile.themeColor) profileDataToUpsert.theme_color = businessProfile.themeColor;
        }

        profileDataToUpsert.layout_style = recommendedLayout.model;

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
                    name: businessName || 'Meu Workspace',
                    document_type: businessProfile.documentType || 'cpf',
                    document: businessProfile.document || null,
                    logo_url: businessProfile.logoUrl || null
                }).eq('id', orgData.organization_id)
            }
        }

        console.log('Successfully applied onboarding kit and updated profile/org.')

        // A welcome message is an activation aid, not a dependency of onboarding.
        // Never block the customer from entering the app if the email provider is unavailable.
        const welcomeEmail = businessProfile?.email || existingProfile?.email || user.email
        if (isFirstOnboarding && welcomeEmail && process.env.RESEND_API_KEY) {
            const recipientName = businessName || existingProfile?.business_name || 'voce'
            const proposalUrl = `${getAppBaseUrl()}/new?quick=1&starter=1&guided=proposal_test`
            try {
                const result = await getResend().emails.send({
                    from: process.env.EMAIL_FROM || 'Zacly <contato@zacly.com.br>',
                    to: welcomeEmail,
                    subject: 'Sua primeira proposta profissional comeca agora | Zacly',
                    text: `Ola, ${recipientName}. Sua conta esta pronta. Crie uma proposta guiada com itens do seu oficio e envie pelo WhatsApp. ${proposalUrl}`,
                    react: ZaclyEmailTemplate({
                        preheader: 'Sua conta esta pronta para criar a primeira proposta.',
                        title: 'Sua conta esta pronta para ganhar tempo',
                        greeting: `Ola, ${recipientName}!`,
                        message: 'Comece com uma proposta guiada usando itens do seu oficio. Em poucos minutos, voce tera um orcamento organizado para enviar pelo WhatsApp.',
                        ctaLabel: 'Criar minha primeira proposta',
                        ctaUrl: proposalUrl,
                    }),
                })

                if (result.error) console.error('Welcome email failed:', result.error)
            } catch (emailError) {
                console.error('Welcome email dispatch failed:', emailError)
            }
        }

        revalidatePath('/', 'layout')
        revalidatePath('/dashboard')
        // Deliberately not revalidating '/onboarding': the user is still on that
        // route looking at the client-side success screen when this runs, and
        // the page's own "already onboarded" guard would immediately redirect
        // them away before they can see it or use its CTA. The route is
        // rendered dynamically per-request anyway, so a fresh visit later
        // always re-checks onboarded_at without needing this call.

        return { success: true }

    } catch (error) {
        console.error("Error applying onboarding kit:", error)
        // Return a serializable error message (Error objects become {} when passed through Server Actions)
        const message = error instanceof Error ? error.message : JSON.stringify(error)
        return { success: false, error: message }
    }
}
