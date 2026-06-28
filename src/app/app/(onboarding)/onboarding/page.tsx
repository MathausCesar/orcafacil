import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { WizardContentClient } from "@/components/onboarding/wizard-content-client";

export default async function OnboardingPage() {
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

    return (
        <OnboardingProvider>
            <WizardContentClient userId={user.id} initialEmail={user.email || ''} />
        </OnboardingProvider>
    );
}
