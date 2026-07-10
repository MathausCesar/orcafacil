"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FileText, Home, Loader2, Palette, RotateCcw } from "lucide-react";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { applyOnboardingKit } from "@/app/actions/onboarding";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { captureActivationStage, captureConversion, captureEvent } from "@/lib/analytics";

export function LoadingSuccess() {
    const { data, prevStep } = useOnboarding();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Iniciando setup...");
    const [complete, setComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        let active = true;

        const runSetup = async () => {
            setProgress(10);
            setStatus("Identificando perfil...");

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                if (!active) return;
                setError("Usuario nao identificado. Entre novamente para concluir.");
                return;
            }

            setProgress(30);
            setStatus("Selecionando melhores servicos...");

            await new Promise(resolve => setTimeout(resolve, 500));
            if (!active) return;

            setProgress(60);
            setStatus(`Configurando catalogo para ${data.category?.name || "seu negocio"}...`);

            const res = await applyOnboardingKit(
                data.category!.id,
                data.specialties,
                data.pricingTier!,
                {
                    businessName: data.businessName,
                    phone: data.phone,
                    documentType: data.documentType,
                    document: data.document,
                    email: data.email,
                    logoUrl: data.logoUrl,
                    themeColor: data.themeColor,
                }
            );

            if (!active) return;

            if (res.success) {
                captureConversion("onboarding_completed", {
                    category_id: data.category?.id,
                    category_name: data.category?.name,
                    specialty_count: data.specialties.length,
                    pricing_tier: data.pricingTier,
                    has_logo: Boolean(data.logoUrl),
                    has_theme_color: Boolean(data.themeColor),
                });
                captureActivationStage("onboarded_no_quote", {
                    category_id: data.category?.id,
                    category_name: data.category?.name,
                    specialty_count: data.specialties.length,
                    pricing_tier: data.pricingTier,
                    has_logo: Boolean(data.logoUrl),
                    source: "onboarding_success",
                });
                if (!data.logoUrl) {
                    captureEvent("logo_prompt_viewed", {
                        source: "onboarding_success",
                        category_id: data.category?.id,
                    });
                }
                setProgress(100);
                setStatus("Catalogo inicial criado.");
                setComplete(true);
            } else {
                console.error("Onboarding error:", res.error);
                setError(typeof res.error === "string" ? res.error : "Nao foi possivel concluir o onboarding.");
            }
        };

        runSetup();

        return () => {
            active = false;
        };
    }, [data]);

    return (
        <div className="mx-auto w-full max-w-md space-y-8 p-4 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {complete ? (
                    <div className="mb-6 flex justify-center">
                        <CheckCircle2 className="h-24 w-24 text-green-500" />
                    </div>
                ) : (
                    <div className="relative mb-6 flex justify-center">
                        <Loader2 className="h-24 w-24 animate-spin text-primary" />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                            {progress}%
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                    {complete ? "Seu Zacly esta pronto" : error ? "Algo impediu a conclusao" : "Quase la..."}
                </h2>
                <p className="text-muted-foreground">
                    {complete
                        ? "Criamos seu catalogo inicial. Agora gere uma proposta teste em 2 minutos com itens sugeridos para seu oficio."
                        : error || status}
                </p>
            </div>

            {!complete && !error && <Progress value={progress} className="h-2 w-full" />}

            {complete && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/new?quick=1&starter=1&source=onboarding_success"
                        className="sm:col-span-2"
                        onClick={() => captureEvent("activation_cta_clicked", {
                            source: "onboarding_success",
                            cta: "create_test_quote",
                            category_id: data.category?.id,
                            has_logo: Boolean(data.logoUrl),
                        })}
                    >
                        <Button className="h-12 w-full font-semibold">
                            <FileText className="mr-2 h-4 w-4" />
                            Criar proposta teste em 2 minutos
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline" className="h-11 w-full">
                            <Home className="mr-2 h-4 w-4" />
                            Ir ao painel
                        </Button>
                    </Link>
                    <Link
                        href="/profile?focus=logo"
                        onClick={() => captureEvent("logo_prompt_clicked", {
                            source: "onboarding_success",
                            category_id: data.category?.id,
                        })}
                    >
                        <Button variant="ghost" className="h-11 w-full">
                            <Palette className="mr-2 h-4 w-4" />
                            Enviar logo
                        </Button>
                    </Link>
                </div>
            )}

            {error && (
                <Button type="button" variant="outline" onClick={prevStep} className="w-full">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Revisar dados
                </Button>
            )}
        </div>
    );
}
