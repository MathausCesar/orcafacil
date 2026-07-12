import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { WizardContentClient } from "@/components/onboarding/wizard-content-client";
import { getActivationIntentFromSearchParams, normalizeActivationIntent } from "@/lib/activation-intent";

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded_at')
        .eq('id', user.id)
        .single();

    if (profile?.onboarded_at) {
        redirect('/');
    }

    const query = await searchParams
    const queryIntent = getActivationIntentFromSearchParams({
        get: (key) => {
            const value = query[key]
            return typeof value === 'string' ? value : null
        },
    })
    const metadataIntent = normalizeActivationIntent(user.user_metadata?.signup_intent)
    const initialIntent = {
        intendedPlan: queryIntent.intendedPlan || metadataIntent.intendedPlan,
        attribution: {
            ...metadataIntent.attribution,
            ...queryIntent.attribution,
        },
    }

    return (
        <OnboardingProvider initialData={initialIntent}>
            <WizardContentClient initialEmail={user.email || ''} />
        </OnboardingProvider>
    );
}
