"use client";

import { useState } from "react";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LogoUpload } from "@/components/profile/logo-upload";
import { extractColors } from "extract-colors";

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

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Extract dominant color from logo when uploaded
    const handleLogoUploaded = async (url: string) => {
        setLogoUrl(url);
        try {
            const colors = await extractColors(url, { crossOrigin: 'anonymous' });
            if (colors && colors.length > 0) {
                // Pick the most vibrant/saturated color (avoid near-whites and near-blacks)
                const filtered = colors.filter(c => c.lightness > 0.15 && c.lightness < 0.85);
                const best = filtered.length > 0 ? filtered[0] : colors[0];
                setThemeColor(best.hex);
            }
        } catch (e) {
            console.error("Color extraction failed during onboarding:", e);
        }
    };

    const handleContinue = () => {
        setIsSubmitting(true);
        updateData({
            businessName,
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
                            onUploadComplete={handleLogoUploaded}
                        />
                        {themeColor && (
                            <div className="flex items-center gap-2 mt-3">
                                <div
                                    className="h-4 w-4 rounded-full border border-border shadow"
                                    style={{ backgroundColor: themeColor }}
                                />
                                <p className="text-[10px] text-muted-foreground">Cor da marca detectada</p>
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground text-center mt-1 max-w-[120px]">
                            Ela será usada no topo dos seus PDFs
                        </p>
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                        <div className="space-y-4 pt-2">
                            <Label>Como você atua?</Label>
                            <RadioGroup
                                defaultValue={documentType}
                                onValueChange={(val) => setDocumentType(val as "cpf" | "cnpj")}
                                className="flex gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cpf" id="cpf" />
                                    <Label htmlFor="cpf" className="cursor-pointer">Pessoa Física (CPF)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cnpj" id="cnpj" />
                                    <Label htmlFor="cnpj" className="cursor-pointer">Pessoa Jurídica (CNPJ)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="businessName">{documentType === 'cpf' ? 'Seu Nome ou Nome Fantasia' : 'Nome da Empresa'}</Label>
                            <Input
                                id="businessName"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder={documentType === 'cpf' ? 'João Silva' : 'Empresa Exemplo LTDA'}
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
                                <Label htmlFor="document">{documentType === 'cpf' ? 'CPF' : 'CNPJ'} (Opcional)</Label>
                                <Input
                                    id="document"
                                    value={document}
                                    onChange={(e) => setDocument(e.target.value)}
                                    placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
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
