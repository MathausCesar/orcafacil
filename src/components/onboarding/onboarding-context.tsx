"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { OnboardingData, INITIAL_ONBOARDING_DATA } from "@/types/onboarding";

type OnboardingContextType = {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
    nextStep: () => void;
    prevStep: () => void;
    step: number;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
    const [step, setStep] = useState(1);

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

    return (
        <OnboardingContext.Provider value={{ data, updateData, nextStep, prevStep, step }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
}
