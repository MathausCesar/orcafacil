"use client";

import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { WizardStep1 } from "@/components/onboarding/wizard-step-1";
import { WizardStep2 } from "@/components/onboarding/wizard-step-2";
import { WizardStep3 } from "@/components/onboarding/wizard-step-3";
import { WizardStep4 } from "@/components/onboarding/wizard-step-4";
import { LoadingSuccess } from "@/components/onboarding/loading-success";
import { AnimatePresence, motion } from "framer-motion";

interface WizardContentClientProps {
    userId: string;
    initialEmail: string;
}

export function WizardContentClient({ userId, initialEmail }: WizardContentClientProps) {
    const { step } = useOnboarding();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl lg:max-w-3xl">
                {/* Progress Dots */}
                {step < 5 && (
                    <div className="flex justify-center space-x-2 mb-12">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-primary" : s < step ? "w-2 bg-primary/50" : "w-2 bg-muted"
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
                        {step === 4 && <WizardStep4 userId={userId} initialEmail={initialEmail} />}
                        {step === 5 && <LoadingSuccess />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
