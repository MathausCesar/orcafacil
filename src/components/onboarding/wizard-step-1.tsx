"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, Hammer, Zap, Scissors, GraduationCap, Briefcase, Utensils } from "lucide-react";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { getOnboardingCategories, OnboardingCategory } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ICONS: Record<string, any> = {
    car: Car,
    hammer: Hammer,
    zap: Zap,
    scissors: Scissors,
    "graduation-cap": GraduationCap,
    briefcase: Briefcase,
    utensils: Utensils,
};

export function WizardStep1() {
    const { data, updateData, nextStep } = useOnboarding();
    const [categories, setCategories] = useState<OnboardingCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const cats = await getOnboardingCategories();
                setCategories(cats);
            } catch (error) {
                console.error("Failed to load categories", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCategories();
    }, []);

    const handleSelect = (category: OnboardingCategory) => {
        updateData({ category });
        // Slight delay for visual feedback
        setTimeout(() => nextStep(), 300);
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Qual é o seu ramo de atuação?</h2>
                <p className="text-muted-foreground">Isso nos ajuda a configurar os serviços ideais para você.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))
                    : categories.map((cat) => {
                        const Icon = ICONS[cat.icon] || Briefcase;
                        const isSelected = data.category?.id === cat.id;

                        return (
                            <motion.button
                                key={cat.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(cat)}
                                className={`
                    relative flex flex-col items-center justify-center p-6 h-32 rounded-xl border-2 transition-all
                    ${isSelected
                                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                                    }
                  `}
                            >
                                <Icon className={`w-8 h-8 mb-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                <span className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                                    {cat.name}
                                </span>
                            </motion.button>
                        );
                    })}
            </div>
        </div>
    );
}
