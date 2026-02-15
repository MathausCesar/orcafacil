"use client";

import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Rocket, Store, Building2 } from "lucide-react";

export function WizardStep3() {
    const { data, updateData, nextStep, prevStep } = useOnboarding();

    const handleSelect = (tier: "autonomous" | "standard" | "premium") => {
        updateData({ pricingTier: tier });
        // Small delay before finalizing
        setTimeout(() => nextStep(), 300);
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Qual o tamanho do seu negócio?</h2>
                <p className="text-muted-foreground">Isso nos ajuda a sugerir preços compatíveis com sua estrutura.</p>
            </div>

            <div className="space-y-4">
                {/* Tier 1: Autonomous */}
                <TierCard
                    icon={Rocket}
                    title="Autônomo / 'Eu-quipe'"
                    description="Trabalho sozinho, custos baixos, preço competitivo."
                    isSelected={data.pricingTier === "autonomous"}
                    onClick={() => handleSelect("autonomous")}
                />

                {/* Tier 2: Small Business */}
                <TierCard
                    icon={Store}
                    title="Pequeno Negócio / Oficina"
                    description="Tenho ponto comercial e equipe enxuta."
                    isSelected={data.pricingTier === "standard"}
                    onClick={() => handleSelect("standard")}
                />

                {/* Tier 3: Premium */}
                <TierCard
                    icon={Building2}
                    title="Empresa Consolidada / Premium"
                    description="Estrutura completa, custos mais altos, valor agregado."
                    isSelected={data.pricingTier === "premium"}
                    onClick={() => handleSelect("premium")}
                />
            </div>

            <div className="flex justify-start pt-4">
                <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
            </div>
        </div>
    );
}

function TierCard({
    icon: Icon,
    title,
    description,
    isSelected,
    onClick
}: {
    icon: any,
    title: string,
    description: string,
    isSelected: boolean,
    onClick: () => void
}) {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className={`
        relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
        ${isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                }
      `}
        >
            <div className={`
        flex items-center justify-center w-12 h-12 rounded-full mr-4 shrink-0
        ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
      `}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {isSelected && (
                <div className="absolute top-4 right-4">
                    <Check className="w-5 h-5 text-primary" />
                </div>
            )}
        </motion.div>
    );
}
