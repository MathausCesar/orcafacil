"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/onboarding-context";
import { applyOnboardingKit } from "@/app/actions/onboarding";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";

export function LoadingSuccess() {
    const { data } = useOnboarding();
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState("Iniciando setup...");
    const [complete, setComplete] = useState(false);

    useEffect(() => {
        const runSetup = async () => {
            // 10% - Getting User
            setProgress(10);
            setStatus("Identificando perfil...");

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setStatus("Erro: Usuário não identificado.");
                return;
            }

            // 30% - Preparing Data
            setProgress(30);
            setStatus("Selecionando melhores serviços...");

            await new Promise(r => setTimeout(r, 800)); // Fake delay for UX

            // 60% - Applying Kit
            setProgress(60);
            setStatus(`Configurando preços para ${data.category?.name}...`);

            const res = await applyOnboardingKit(
                user.id,
                data.category!.id,
                data.specialties,
                data.pricingTier!
            );

            if (res.success) {
                setProgress(100);
                setStatus("Tudo pronto!");
                setComplete(true);

                setTimeout(() => {
                    router.push("/");
                    router.refresh();
                }, 1500);
            } else {
                console.error("Onboarding error:", res.error);
                setStatus(`Deu erro: ${JSON.stringify(res.error)}`);
            }
        };

        runSetup();
    }, [data, router]);

    return (
        <div className="text-center space-y-8 max-w-md w-full mx-auto p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {complete ? (
                    <div className="flex justify-center mb-6">
                        <CheckCircle2 className="w-24 h-24 text-green-500" />
                    </div>
                ) : (
                    <div className="flex justify-center mb-6 relative">
                        <Loader2 className="w-24 h-24 text-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                            {progress}%
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                    {complete ? "Sua oficina está pronta!" : "Quase lá..."}
                </h2>
                <p className="text-muted-foreground animate-pulse">
                    {status}
                </p>
            </div>

            <Progress value={progress} className="h-2 w-full" />
        </div>
    );
}
