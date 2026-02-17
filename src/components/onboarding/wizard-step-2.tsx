"use client";

import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

// In a real app, these would come from the database based on category_id
// For MVP, we map them here corresponding to the 'specialty_tags' in DB
const SPECIALTIES_BY_CATEGORY: Record<string, { label: string; value: string }[]> = {
    auto: [
        { label: "Mecânica Geral", value: "mecanica_geral" },
        { label: "Auto Elétrica", value: "eletrica" },
        { label: "Funilaria e Pintura", value: "funilaria" },
        { label: "Estética Automotiva", value: "estetica" },
        { label: "Suspensão e Freios", value: "freios" },
        { label: "Som e Acessórios", value: "som" },
    ],
    construction: [
        { label: "Pedreiro / Alvenaria", value: "pedreiro" },
        { label: "Pintura e Acabamento", value: "pintor" },
        { label: "Marido de Aluguel", value: "marido_aluguel" },
        { label: "Gesso e Drywall", value: "gesso" },
        { label: "Telhados e Coberturas", value: "telhado" },
    ],
    tech: [
        { label: "Eletricista Residencial", value: "eletricista" },
        { label: "Ar Condicionado", value: "ar_condicionado" },
        { label: "Informática / TI", value: "ti" },
        { label: "Segurança Eletrônica", value: "seguranca" },
    ],
    beauty: [
        { label: "Cabeleireiro(a)", value: "cabelo" },
        { label: "Barbearia", value: "barbearia" },
        { label: "Manicure / Pedicure", value: "unhas" },
        { label: "Estética Facial/Corporal", value: "estetica" },
    ],
    education: [
        { label: "Professor Particular", value: "professor" },
        { label: "Personal Trainer", value: "personal" },
        { label: "Consultoria", value: "consultoria" },
    ],
    food: [
        { label: "Salgados e Doces", value: "salgados" },
        { label: "Confeitaria", value: "confeitaria" },
        { label: "Buffet Completo", value: "buffet" },
        { label: "Serviços Extras (Garçom, Copeira)", value: "servicos" },
        { label: "Decoração de Eventos", value: "decoracao" },
    ],
};

export function WizardStep2() {
    const { data, updateData, nextStep, prevStep } = useOnboarding();

    if (!data.category) return null;

    const options = SPECIALTIES_BY_CATEGORY[data.category.slug || ""] || [];

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
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">O que você faz de melhor?</h2>
                <p className="text-muted-foreground">Selecione suas especialidades (múltipla escolha).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt) => (
                    <motion.div
                        key={opt.value}
                        whileTap={{ scale: 0.98 }}
                        className={`
              flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors
              ${data.specialties.includes(opt.value)
                                ? "bg-primary/5 border-primary"
                                : "bg-background border-border hover:bg-muted"
                            }
            `}
                        onClick={() => handleToggle(opt.value)}
                    >
                        <Checkbox
                            checked={data.specialties.includes(opt.value)}
                            onCheckedChange={() => handleToggle(opt.value)}
                            className="pointer-events-none" // Handle click on container
                        />
                        <Label className="cursor-pointer font-medium">{opt.label}</Label>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button onClick={nextStep} disabled={data.specialties.length === 0}>
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
