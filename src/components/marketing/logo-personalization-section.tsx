import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, Palette, Sparkles, Upload } from "lucide-react";
import { MARKETING_LINKS } from "@/lib/marketing-links";

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

function ProposalPreview() {
    return (
        <div className="rounded-2xl border border-white/10 bg-white p-4 text-slate-950 shadow-2xl shadow-black/30">
            <div className="rounded-xl bg-[#111827] p-4 text-white">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-2 text-center text-[10px] font-black leading-tight text-[#111827]">
                            AUTO PRIME
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                                Proposta comercial
                            </p>
                            <h3 className="mt-1 text-lg font-black">Revisao completa</h3>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-[#22c55e]" />
                </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-black text-slate-600">
                        <Sparkles className="h-4 w-4 text-emerald-600" />
                        Logo analisada
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 rounded-full bg-[#22c55e]" />
                        <div className="h-2 w-3/4 rounded-full bg-slate-300" />
                        <div className="h-2 w-1/2 rounded-full bg-slate-200" />
                    </div>
                    <p className="mt-4 text-xs leading-5 text-slate-500">
                        Paleta segura para destacar valor, prazo e aprovacao.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between text-xs font-black text-slate-500">
                        <span>Itens e servicos</span>
                        <span>Total</span>
                    </div>
                    {[
                        ["Mao de obra", "R$ 280"],
                        ["Pecas", "R$ 390"],
                        ["Garantia", "Inclusa"],
                    ].map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between border-t border-slate-100 py-2 text-sm">
                            <span className="font-semibold text-slate-700">{label}</span>
                            <span className="font-black">{value}</span>
                        </div>
                    ))}
                    <div className="mt-3 rounded-xl bg-[#22c55e] px-4 py-3 text-sm font-black text-[#052e16]">
                        Cliente aprova pelo link
                    </div>
                </div>
            </div>
        </div>
    );
}

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

                <ProposalPreview />
            </div>
        </section>
    );
}
