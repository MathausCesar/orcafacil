import type { OnboardingPricingTier } from "@/lib/onboarding-catalog";
import type { IntendedPlan } from "@/lib/activation-intent";

export type OnboardingData = {
    category: { id: string; name: string; slug: string } | null;
    specialties: string[];
    pricingTier: OnboardingPricingTier | null;
    businessName: string;
    phone: string;
    documentType: "cpf" | "cnpj";
    document: string;
    email: string;
    logoUrl: string | null;
    themeColor: string | null;
    intendedPlan: IntendedPlan | null;
    attribution: Record<string, string>;
};

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
    category: null,
    specialties: [],
    pricingTier: null,
    businessName: "",
    phone: "",
    documentType: "cpf",
    document: "",
    email: "",
    logoUrl: null,
    themeColor: null,
    intendedPlan: null,
    attribution: {},
};
