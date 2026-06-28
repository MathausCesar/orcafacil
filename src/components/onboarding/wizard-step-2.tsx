"use client";

import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getSpecialtiesForCategory } from "@/lib/onboarding-catalog";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function WizardStep2() {
    const { data, updateData, nextStep, prevStep } = useOnboarding();

    if (!data.category) return null;

    const options = getSpecialtiesForCategory(data.category.slug);

    const handleToggle = (value: string) => {
        const current = data.specialties;
        if (current.includes(value)) {
            updateData({ specialties: current.filter((s) => s !== value) });
        } else {
            updateData({ specialties: [...current, value] });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight">O que voce faz de melhor?</h2>
                <p className="text-muted-foreground">
                    Selecione suas especialidades para montar um catalogo inicial util.
                </p>
            </div>

            {options.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {options.map((opt) => (
                        <motion.div
                            key={opt.value}
                            whileTap={{ scale: 0.98 }}
                            className={`
                                flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors
                                ${data.specialties.includes(opt.value)
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-background hover:bg-muted"
                                }
                            `}
                            onClick={() => handleToggle(opt.value)}
                        >
                            <Checkbox
                                checked={data.specialties.includes(opt.value)}
                                onCheckedChange={() => handleToggle(opt.value)}
                                className="pointer-events-none"
                            />
                            <Label className="cursor-pointer font-medium">{opt.label}</Label>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                    <p className="font-semibold text-foreground">Nenhuma especialidade pronta para este ramo.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Volte e escolha um ramo parecido ou siga pelo perfil geral.
                    </p>
                </div>
            )}

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={nextStep} disabled={data.specialties.length === 0}>
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
