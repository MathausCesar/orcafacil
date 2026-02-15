export type OnboardingData = {
    category: { id: string; name: string; slug: string } | null;
    specialties: string[];
    pricingTier: "autonomous" | "standard" | "premium" | null;
};

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
    category: null,
    specialties: [],
    pricingTier: null,
};
