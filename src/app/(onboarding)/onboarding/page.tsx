import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";
import { WizardStep1 } from "@/components/onboarding/wizard-step-1";
import { WizardStep2 } from "@/components/onboarding/wizard-step-2";
import { WizardStep3 } from "@/components/onboarding/wizard-step-3";
import { LoadingSuccess } from "@/components/onboarding/loading-success";
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
