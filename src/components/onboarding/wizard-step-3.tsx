"use client";

import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { Button } from "@/components/ui/button";
import { PRICING_TIER_COPY, type OnboardingPricingTier } from "@/lib/onboarding-catalog";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Gem, Gauge, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TIER_OPTIONS: Array<{
    id: OnboardingPricingTier;
    icon: LucideIcon;
    multiplierLabel: string;
}> = [
        { id: "autonomous", icon: Rocket, multiplierLabel: "20% abaixo da base" },
        { id: "standard", icon: Gauge, multiplierLabel: "base equilibrada" },
        { id: "premium", icon: Gem, multiplierLabel: "50% acima da base" },
    ];

export function WizardStep3() {
    const { data, updateData, nextStep, prevStep } = useOnboarding();

    const handleSelect = (tier: OnboardingPricingTier) => {
        updateData({ pricingTier: tier });
        setTimeout(() => nextStep(), 300);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Qual faixa de preco voce quer sugerir?</h2>
                <p className="text-muted-foreground">
                    Isso ajusta apenas os valores iniciais do catalogo. Voce pode editar tudo depois.
                </p>
            </div>

            <div className="space-y-4">
                {TIER_OPTIONS.map((option) => {
                    const copy = PRICING_TIER_COPY[option.id];

                    return (
                        <TierCard
                            key={option.id}
                            icon={option.icon}
                            title={copy.title}
                            description={copy.description}
                            multiplierLabel={option.multiplierLabel}
                            isSelected={data.pricingTier === option.id}
                            onClick={() => handleSelect(option.id)}
                        />
                    );
                })}
            </div>

            <div className="flex justify-start pt-4">
                <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
            </div>
        </div>
    );
}

function TierCard({
    icon: Icon,
    title,
    description,
    multiplierLabel,
    isSelected,
    onClick
}: {
    icon: LucideIcon;
    title: string;
    description: string;
    multiplierLabel: string;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={`
                relative flex w-full items-center rounded-xl border-2 p-4 text-left transition-all
                ${isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                }
            `}
        >
            <div className={`
                mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full
                ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
            `}>
                <Icon className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {multiplierLabel}
                    </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>

            {isSelected && (
                <div className="absolute right-4 top-4">
                    <Check className="h-5 w-5 text-primary" />
                </div>
            )}
        </motion.button>
    );
}
