"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LogoUpload } from "@/components/profile/logo-upload";

interface WizardStep4Props {
    userId: string;
    initialEmail: string;
}

export function WizardStep4({ userId, initialEmail }: WizardStep4Props) {
    const { data, updateData, nextStep, prevStep } = useOnboarding();

    // Initialize state from context, but if context is empty, use default overrides
    const [businessName, setBusinessName] = useState(data.businessName || "");
    const [phone, setPhone] = useState(data.phone || "");
    const [cnpj, setCnpj] = useState(data.cnpj || "");
    const [email, setEmail] = useState(data.email || initialEmail);
    const [logoUrl, setLogoUrl] = useState(data.logoUrl || null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sync state whenever fields change to keep context updated
    const handleContinue = () => {
        setIsSubmitting(true);
        updateData({
            businessName,
            phone,
            cnpj,
            email,
            logoUrl
        });

        // Brief delay before next step
        setTimeout(() => nextStep(), 300);
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Identidade da sua Empresa</h2>
                <p className="text-muted-foreground">Configure os dados que aparecerão nos seus orçamentos.</p>
            </div>

            <div className="bg-card w-full p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        <Label className="mb-4 text-center">Sua Logo</Label>
                        <LogoUpload
                            currentLogoUrl={logoUrl}
                            userId={userId}
                            onUploadComplete={(url) => setLogoUrl(url)}
                        />
                        <p className="text-[10px] text-muted-foreground text-center mt-3 max-w-[120px]">
                            Ela será usada no topo dos seus PDFs
                        </p>
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Nome do Negócio</Label>
                            <Input
                                id="businessName"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Boutique Arquitetura"
                                className="h-10 border-primary/20 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">WhatsApp / Telefone</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="h-10 border-primary/20 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                                <Input
                                    id="cnpj"
                                    value={cnpj}
                                    onChange={(e) => setCnpj(e.target.value)}
                                    placeholder="00.000.000/0000-00"
                                    className="h-10 font-mono border-primary/20 focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email de Contato</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="contato@empresa.com"
                                className="h-10 border-primary/20 focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex bg-card items-center justify-between mt-8 p-4 rounded-xl border border-border">
                <Button variant="ghost" onClick={prevStep} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
                <Button onClick={handleContinue} className="font-semibold shadow-md" disabled={isSubmitting}>
                    {isSubmitting ? "Finalizando..." : "Concluir Setup"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
