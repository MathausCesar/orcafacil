export type OnboardingData = {
    category: { id: string; name: string; slug: string } | null;
    specialties: string[];
    pricingTier: "autonomous" | "standard" | "premium" | null;
    businessName: string;
    phone: string;
    cnpj: string;
    email: string;
    logoUrl: string | null;
};

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
    category: null,
    specialties: [],
    pricingTier: null,
    businessName: "",
    phone: "",
    cnpj: "",
    email: "",
    logoUrl: null,
};
