import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Palette, Sparkles, Upload } from "lucide-react";
import { MARKETING_LINKS } from "@/lib/marketing-links";
import { LogoDemoPlayground } from "@/components/marketing/logo-demo-playground";

const steps = [
    {
        icon: Upload,
        title: "Envie sua logo",
        text: "Pode ser PNG, JPG ou WebP. O Zacly salva a marca no seu perfil.",
    },
    {
        icon: Palette,
        title: "Detectamos a cor",
        text: "A cor principal vira base para cabecalho, destaques e botoes da proposta.",
    },
    {
        icon: FileText,
        title: "A proposta nasce pronta",
        text: "O layout fica com cara de empresa, sem o usuario montar tudo manualmente.",
    },
];

export function LogoPersonalizationSection() {
    return (
        <section className="border-y border-white/10 bg-zinc-900 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                        <Sparkles className="h-4 w-4" />
                        Diferencial Zacly
                    </p>
                    <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Sua logo vira a identidade da proposta.
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
                        O autonomo nao precisa entender de design. Ele envia a logo, o Zacly identifica a cor principal e monta uma proposta com visual mais profissional, consistente e confiavel.
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        {steps.map((step) => {
                            const Icon = step.icon;

                            return (
                                <div key={step.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                                    <Icon className="h-5 w-5 text-emerald-300" />
                                    <h3 className="mt-4 text-sm font-black text-white">{step.title}</h3>
                                    <p className="mt-2 text-xs leading-5 text-zinc-400">{step.text}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={MARKETING_LINKS.register}
                            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-black text-zinc-950 transition hover:bg-emerald-300"
                        >
                            Criar proposta com minha logo
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-300">
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            Sem precisar montar layout do zero
                        </div>
                    </div>
                </div>

                <LogoDemoPlayground
                    industryLabel="seu negocio"
                    title="Teste com sua logo agora."
                    subtitle="Veja a paleta, o modelo sugerido e uma proposta simulada sem precisar criar conta primeiro."
                    campaignContent="logo_demo_home"
                />
            </div>
        </section>
    );
}
