"use client";

import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";
import Link from "next/link";
import { PRICING, YEARLY_MONTHLY_EQUIV, YEARLY_SAVINGS, formatCurrencyBR, formatNumberBR } from "@/lib/pricing-copy";
import { MARKETING_LINKS } from "@/lib/marketing-links";

export function PricingSection() {
    return (
        <section id="planos" className="py-24 md:py-32 bg-[#050505] relative overflow-hidden">
            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-4xl md:text-6xl font-black uppercase text-white mb-6"
                    >
                        Um serviço fechado pode{" "}
                        <span className="block text-emerald-500">pagar o ano todo.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-zinc-300 font-light leading-relaxed"
                    >
                        O plano anual custa {formatCurrencyBR(PRICING.yearly)}. Se o Zacly ajudar você a fechar um serviço extra acima desse valor, ele já se pagou.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5 }}
                        className="bg-zinc-900/50 border border-white/10 p-8 flex flex-col backdrop-blur-sm rounded-2xl"
                    >
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Básico</h3>
                            <p className="text-zinc-400 text-sm">Para testar com clientes reais.</p>
                        </div>
                        <div className="mb-8 font-black text-4xl text-white">
                            Grátis
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-zinc-300 text-sm">Até {PRICING.freeQuotesPerMonth} orçamentos por mês</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-zinc-300 text-sm">Painel para acompanhar propostas</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-zinc-300 text-sm">Envio por WhatsApp com link</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-55">
                                <X className="h-5 w-5 text-zinc-500 shrink-0" />
                                <span className="text-zinc-500 text-sm">Pode manter marca Zacly no PDF</span>
                            </li>
                        </ul>
                        <Link
                            href={MARKETING_LINKS.registerFree}
                            className="w-full py-4 rounded-xl border border-zinc-700 text-white text-center font-bold hover:bg-zinc-800 transition-colors"
                        >
                            Começar grátis
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative bg-zinc-900 border border-emerald-500/60 p-10 flex flex-col rounded-2xl md:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.15)] z-10"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                            <Star className="w-3 h-3 fill-black" /> Melhor custo-benefício
                        </div>

                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Pro Anual</h3>
                            <p className="text-emerald-400 text-sm font-medium">Economize {formatCurrencyBR(YEARLY_SAVINGS)} por ano</p>
                        </div>

                        <div className="mb-8 flex flex-col items-center">
                            <div className="flex items-end gap-1 mb-1">
                                <span className="font-black text-6xl text-white">
                                    {formatNumberBR(YEARLY_MONTHLY_EQUIV).split(",")[0]}
                                    <span className="text-3xl text-zinc-400">,{formatNumberBR(YEARLY_MONTHLY_EQUIV).split(",")[1]}</span>
                                </span>
                                <span className="text-zinc-400 text-sm mb-2">/mês</span>
                            </div>
                            <p className="text-sm text-zinc-300">
                                <span className="font-bold text-white">{formatCurrencyBR(PRICING.yearly)}</span> cobrados hoje
                            </p>
                            <p className="text-xs text-zinc-500 mt-1 text-center">
                                Renovação anual automática. Cancele antes da próxima renovação.
                            </p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {[
                                "Orçamentos ilimitados",
                                "Sua marca no PDF, sem marca Zacly",
                                "Acompanhamento de abertura e aprovação",
                                "Exportação, modelos e painel Pro",
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                    <span className="text-white text-sm font-medium">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href={MARKETING_LINKS.registerYearly}
                            className="relative group w-full py-4 rounded-xl bg-emerald-500 text-black text-center font-black uppercase tracking-wide overflow-hidden hover:scale-[1.02] transition-transform"
                        >
                            <span className="relative z-10">Criar conta e escolher anual</span>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-zinc-900/50 border border-white/10 p-8 flex flex-col backdrop-blur-sm rounded-2xl"
                    >
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Pro Mensal</h3>
                            <p className="text-zinc-400 text-sm">Para quem quer flexibilidade.</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-end gap-1">
                                <span className="text-lg font-bold text-zinc-500 mb-1">R$</span>
                                <span className="font-black text-4xl text-white">
                                    {formatNumberBR(PRICING.monthly).split(",")[0]}
                                    <span className="text-2xl text-zinc-500">,{formatNumberBR(PRICING.monthly).split(",")[1]}</span>
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">Assinatura mensal. Cancele quando quiser.</p>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {[
                                "Orçamentos ilimitados",
                                "Sua marca no PDF",
                                "Acompanhamento em tempo real",
                            ].map((feature) => (
                                <li key={feature} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                    <span className="text-zinc-300 text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            href={MARKETING_LINKS.registerMonthly}
                            className="w-full py-4 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-center font-bold hover:bg-zinc-700 transition-colors"
                        >
                            Criar conta e escolher mensal
                        </Link>
                    </motion.div>
                </div>

                <p className="mt-10 text-center text-sm text-zinc-400">
                    Pagamento seguro via Stripe. A Zacly não armazena dados do cartão.
                </p>
            </div>
        </section>
    );
}
