"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { WizardStep1 } from "@/components/onboarding/wizard-step-1";
import { WizardStep2 } from "@/components/onboarding/wizard-step-2";
import { WizardStep3 } from "@/components/onboarding/wizard-step-3";
import { WizardStep4 } from "@/components/onboarding/wizard-step-4";
import { LoadingSuccess } from "@/components/onboarding/loading-success";
import { AnimatePresence, motion } from "framer-motion";
import { captureEvent } from "@/lib/analytics";

interface WizardContentClientProps {
    initialEmail: string;
}

export function WizardContentClient({ initialEmail }: WizardContentClientProps) {
    const { step } = useOnboarding();
    const visualStep = step >= 4 ? 2 : 1;
    const router = useRouter();

    useEffect(() => {
        captureEvent(step === 1 ? "onboarding_started" : "onboarding_step_viewed", {
            step,
            visual_step: visualStep,
            source: "onboarding_wizard",
        });
    }, [step, visualStep]);

    useEffect(() => {
        // The completion step calls a server action that revalidates shared
        // routes (dashboard, layout). That can trigger this page's own
        // "already onboarded" server-side guard to re-run and redirect away
        // mid-flow, bouncing the user off the success screen before they can
        // use it. Marking the URL once we reach it lets that guard recognize
        // this is the intended completion view rather than a stale revisit.
        if (step === 5) {
            router.replace('/onboarding?step=success', { scroll: false })
        }
    }, [step, router])

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl lg:max-w-3xl">
                {/* Progress Dots */}
                {step < 5 && (
                    <div className="flex justify-center space-x-2 mb-12">
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-300 ${s === visualStep ? "w-8 bg-primary" : s < visualStep ? "w-2 bg-primary/50" : "w-2 bg-muted"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {step === 1 && <WizardStep1 />}
                        {step === 2 && <WizardStep2 />}
                        {step === 3 && <WizardStep3 />}
                        {step === 4 && <WizardStep4 initialEmail={initialEmail} />}
                        {step === 5 && <LoadingSuccess />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
