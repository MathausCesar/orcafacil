"use client";

import { useState } from "react";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Palette, Sparkles } from "lucide-react";
import { LogoUpload } from "@/components/profile/logo-upload";
import type { LogoIdentityAnalysis } from "@/lib/color-extractor";
import { toast } from "sonner";
import { formatDocument, validateDocument } from "@/lib/utils/document";

interface WizardStep4Props {
    userId: string;
    initialEmail: string;
}

export function WizardStep4({ userId, initialEmail }: WizardStep4Props) {
    const { data, updateData, nextStep, prevStep } = useOnboarding();

    const [businessName, setBusinessName] = useState(data.businessName || "");
    const [phone, setPhone] = useState(data.phone || "");
    const [documentType, setDocumentType] = useState<"cpf" | "cnpj">(data.documentType || "cpf");
    const [document, setDocument] = useState(data.document || "");
    const [email, setEmail] = useState(data.email || initialEmail);
    const [logoUrl, setLogoUrl] = useState(data.logoUrl || null);
    const [themeColor, setThemeColor] = useState<string | null>(data.themeColor || null);
    const [logoAnalysis, setLogoAnalysis] = useState<LogoIdentityAnalysis | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogoUploaded = (url: string) => {
        setLogoUrl(url);
    };

    const handleLogoAnalyzed = (analysis: LogoIdentityAnalysis) => {
        setLogoAnalysis(analysis);
        setThemeColor(analysis.safeAccentColor);
    };

    const handleContinue = () => {
        if (!businessName.trim()) {
            toast.error("Informe seu nome ou o nome do negocio.");
            return;
        }

        if (document && !validateDocument(document, documentType)) {
            toast.error(`O ${documentType.toUpperCase()} informado e invalido. Verifique os numeros digitados.`);
            return;
        }

        setIsSubmitting(true);
        updateData({
            businessName: businessName.trim(),
            phone,
            documentType,
            document,
            email,
            logoUrl,
            themeColor,
        });

        setTimeout(() => nextStep(), 300);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight">Identidade da sua empresa</h2>
                <p className="text-muted-foreground">Configure os dados que aparecerao nos seus orcamentos.</p>
            </div>

            <div className="w-full space-y-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-start gap-8 md:flex-row">
                    <div className="flex w-full flex-col items-center md:w-1/3">
                        <Label className="mb-4 text-center">Sua logo</Label>
                        <LogoUpload
                            currentLogoUrl={logoUrl}
                            userId={userId}
                            onUploadComplete={handleLogoUploaded}
                            onColorExtracted={setThemeColor}
                            onLogoAnalyzed={handleLogoAnalyzed}
                        />
                        {themeColor && (
                            <div className="mt-3 flex items-center gap-2">
                                <div
                                    className="h-4 w-4 rounded-full border border-border shadow"
                                    style={{ backgroundColor: themeColor }}
                                />
                                <p className="text-[10px] text-muted-foreground">Cor da marca detectada</p>
                            </div>
                        )}
                        <p className="mt-1 max-w-[120px] text-center text-[10px] text-muted-foreground">
                            Ela sera usada no topo das suas propostas.
                        </p>
                        <div className="mt-4 w-full rounded-xl border border-primary/15 bg-primary/5 p-3 text-left">
                            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Layout com sua identidade
                            </div>
                            <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                                O Zacly analisa a logo, escolhe uma cor segura e prepara um visual limpo para a proposta.
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
                                <Palette className="h-3.5 w-3.5" />
                                {logoAnalysis ? `${logoAnalysis.styleLabel} recomendado.` : "Menos configuracao manual."}
                            </div>
                            {logoAnalysis && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {logoAnalysis.palette.slice(0, 3).map((color) => (
                                        <span
                                            key={color}
                                            className="h-4 w-4 rounded-full border border-border"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full space-y-4 md:w-2/3">
                        <div className="space-y-4 pt-2">
                            <Label>Como voce atua?</Label>
                            <RadioGroup
                                defaultValue={documentType}
                                onValueChange={(val) => {
                                    const newType = val as "cpf" | "cnpj";
                                    setDocumentType(newType);
                                    if (document) {
                                        setDocument(formatDocument(document, newType));
                                    }
                                }}
                                className="flex flex-col gap-3 sm:flex-row sm:gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cpf" id="cpf" />
                                    <Label htmlFor="cpf" className="cursor-pointer">Pessoa fisica</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cnpj" id="cnpj" />
                                    <Label htmlFor="cnpj" className="cursor-pointer">Pessoa juridica</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="businessName">
                                {documentType === "cpf" ? "Seu nome ou nome fantasia" : "Nome da empresa"} *
                            </Label>
                            <Input
                                id="businessName"
                                value={businessName}
                                onChange={(event) => setBusinessName(event.target.value)}
                                placeholder={documentType === "cpf" ? "Joao Silva" : "Empresa Exemplo LTDA"}
                                required
                                className="h-10 border-primary/20 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="phone">WhatsApp / telefone</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="h-10 border-primary/20 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="document">{documentType === "cpf" ? "CPF" : "CNPJ"} opcional</Label>
                                <Input
                                    id="document"
                                    value={document}
                                    onChange={(event) => setDocument(formatDocument(event.target.value, documentType))}
                                    placeholder={documentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                                    maxLength={documentType === "cpf" ? 14 : 18}
                                    className="h-10 border-primary/20 font-mono focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email de contato</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="contato@empresa.com"
                                className="h-10 border-primary/20 focus-visible:ring-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <Button variant="ghost" onClick={prevStep} className="text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
                <Button onClick={handleContinue} className="font-semibold shadow-md" disabled={isSubmitting}>
                    {isSubmitting ? "Finalizando..." : "Concluir setup"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
