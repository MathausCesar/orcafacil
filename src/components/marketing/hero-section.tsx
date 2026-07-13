"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, FileText } from "lucide-react";
import { MARKETING_COPY } from "@/lib/pricing-copy";
import { MARKETING_LINKS } from "@/lib/marketing-links";
import { CampaignRegisterLink } from "@/components/marketing/campaign-register-link";

const professions = ["Mecânicos", "Marceneiros", "Eletricistas", "Pintores", "Técnicos", "Instaladores"];

function HeroPreview() {
    return (
        <div
            id="exemplo"
            className="mt-12 w-full max-w-5xl rounded-[28px] border border-white/10 bg-white/[0.03] p-3 shadow-2xl shadow-black/40 backdrop-blur"
        >
            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
                <div className="min-h-[290px] rounded-2xl bg-white text-zinc-950 p-5 shadow-xl">
                    <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                <FileText className="h-3.5 w-3.5" />
                                Proposta comercial
                            </div>
                            <h3 className="mt-4 text-2xl font-black tracking-tight">Reparo elétrico residencial</h3>
                            <p className="mt-1 text-sm text-zinc-500">Validade: 7 dias • Prazo: 2 dias úteis</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center text-xs font-black">
                            SUA
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {[
                            ["Troca de disjuntor", "1", "R$ 180,00"],
                            ["Revisão de tomadas", "6", "R$ 240,00"],
                            ["Material elétrico", "1", "R$ 135,00"],
                        ].map(([item, qty, price]) => (
                            <div key={item} className="grid grid-cols-[1fr_40px_86px] items-center gap-3 rounded-xl bg-zinc-50 px-3 py-3 text-sm">
                                <span className="font-semibold text-zinc-700">{item}</span>
                                <span className="text-center text-zinc-500">{qty}</span>
                                <span className="text-right font-bold">{price}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-zinc-950 px-4 py-4 text-white">
                        <span className="text-sm text-zinc-300">Total aprovado</span>
                        <span className="text-2xl font-black">R$ 555,00</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-[#071f19] p-5 text-left">
                    <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp pronto
                    </div>
                    <div className="mt-5 rounded-2xl rounded-tl-sm bg-emerald-500 px-4 py-3 text-sm font-medium text-zinc-950">
                        Olá, segue seu orçamento com descrição, prazo, forma de pagamento e link para aprovação.
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wider text-zinc-400">Cliente recebe</p>
                        <p className="mt-2 text-lg font-black text-white">Botão de aprovação</p>
                        <p className="mt-1 text-sm text-zinc-300">Sem baixar app e sem cadastro.</p>
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-sm text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Link aberto pelo cliente
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 text-left">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Pipeline</p>
                    <h3 className="mt-2 text-xl font-black text-white">Acompanhe até fechar</h3>
                    <div className="mt-6 space-y-3">
                        {[
                            ["Enviado", "100%"],
                            ["Aberto", "72%"],
                            ["Aprovado", "38%"],
                            ["Em execução", "22%"],
                        ].map(([label, width]) => (
                            <div key={label}>
                                <div className="mb-1 flex justify-between text-xs text-zinc-400">
                                    <span>{label}</span>
                                    <span>{width}</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/10">
                                    <div className="h-full rounded-full bg-emerald-400" style={{ width }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm leading-relaxed text-zinc-300">
                        Menos orçamento perdido no WhatsApp. Mais clareza sobre quem precisa de retorno.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function HeroSection() {
    return (
        <section className="relative w-full overflow-hidden bg-zinc-950 pt-28 md:pt-32 pb-20">
            <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-950/40 to-transparent pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto text-center flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-200 text-xs font-bold mb-7 uppercase tracking-[0.16em] backdrop-blur-sm">
                    Feito para quem hoje faz orçamento no papel, WhatsApp ou planilha
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.04] text-white mb-7 max-w-5xl">
                    Transforme preço solto no WhatsApp em uma aprovação profissional.
                </h1>

                <p className="text-lg md:text-2xl text-zinc-300 max-w-3xl font-light leading-relaxed mb-7">
                    {MARKETING_COPY.corePromise}
                </p>

                <div
                    className="flex flex-wrap justify-center gap-2 mb-9"
                    aria-label="Profissões atendidas"
                >
                    {professions.map((profession) => (
                        <span key={profession} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-300">
                            {profession}
                        </span>
                    ))}
                </div>

                <div className="flex flex-col items-center justify-center gap-4 w-full sm:w-auto">
                    <CampaignRegisterLink
                        campaign="homepage_hero"
                        nextPath="/onboarding"
                        className="group h-14 px-8 rounded-full bg-white text-black font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.03] active:scale-95 w-full sm:w-auto"
                    >
                        <span>Criar proposta teste da minha oficina</span>
                        <span className="bg-black/10 rounded-full p-1.5 transition-transform group-hover:translate-x-1">
                            <ArrowRight className="h-5 w-5" />
                        </span>
                    </CampaignRegisterLink>
                    <Link
                        href={MARKETING_LINKS.exampleQuote}
                        className="text-sm text-zinc-400 font-medium hover:text-white underline underline-offset-4 transition-colors"
                    >
                        Ver exemplo de proposta
                    </Link>
                </div>

                <p className="text-sm text-zinc-400 font-medium mt-5">
                    {MARKETING_COPY.signupHint}
                </p>

                <HeroPreview />
            </div>

            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </section>
    );
}
