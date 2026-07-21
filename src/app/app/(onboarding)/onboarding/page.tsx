import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { WizardContentClient } from "@/components/onboarding/wizard-content-client";
import {
    getActivationIntentFromSearchParams,
    mergeActivationIntents,
} from "@/lib/activation-intent";

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

    const query = await searchParams

    // The wizard's own completion step marks the URL with ?step=success once
    // it applies the onboarding kit. That action revalidates shared routes,
    // which can cause this Server Component to re-run while the user is still
    // looking at the success screen — skip the redirect in that case instead
    // of bouncing them away from their own completion CTA.
    if (profile?.onboarded_at && query.step !== 'success') {
        redirect('/');
    }

    const queryIntent = getActivationIntentFromSearchParams({
        get: (key) => {
            const value = query[key]
            return typeof value === 'string' ? value : null
        },
    })
    const initialIntent = mergeActivationIntents(
        user.user_metadata?.signup_intent,
        queryIntent,
    )

    return (
        <OnboardingProvider initialData={initialIntent}>
            <WizardContentClient initialEmail={user.email || ''} />
        </OnboardingProvider>
    );
}
