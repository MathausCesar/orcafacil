"use client";

import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-4xl md:text-6xl font-black uppercase text-white mb-6"
                    >
                        UM ORÇAMENTO FECHADO <br />
                        <span className="text-emerald-500">PAGA O ANO TODO.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-zinc-400 font-light"
                    >
                        Profissionalismo não é um custo, é o investimento com o maior retorno que existe para o seu negócio.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">

                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5 }}
                        className="bg-zinc-900/40 border border-white/10 p-8 flex flex-col backdrop-blur-sm rounded-2xl"
                    >
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Básico</h3>
                            <p className="text-zinc-500 text-sm">Para testar a ferramenta.</p>
                        </div>
                        <div className="mb-8 font-black text-4xl text-white">
                            Grátis
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-zinc-300 text-sm">Até 5 orçamentos p/ mês</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-zinc-300 text-sm">Dashboard de Controle</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-40">
                                <X className="h-5 w-5 text-zinc-500 shrink-0" />
                                <span className="text-zinc-500 line-through text-sm">Visual premium com sua logo</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-40">
                                <X className="h-5 w-5 text-zinc-500 shrink-0" />
                                <span className="text-zinc-500 text-sm">Marca d'água Zacly mantida</span>
                            </li>
                        </ul>
                        <Link href="https://app.zacly.com.br/register">
                            <button className="w-full py-4 rounded-xl border border-zinc-700 text-white font-bold hover:bg-zinc-800 transition-colors">
                                Criar Conta Grátis
                            </button>
                        </Link>
                    </motion.div>

                    {/* Annual Plan (THE ANCHOR) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative bg-zinc-900 border border-emerald-500/50 p-10 flex flex-col rounded-2xl md:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.15)] z-10"
                    >
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                            <Star className="w-3 h-3 fill-black" /> Escolha Inteligente
                        </div>

                        <div className="mb-6 text-center">
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Pro Anual</h3>
                            <p className="text-emerald-400 text-sm font-medium">Economize R$ 240 por ano</p>
                        </div>

                        <div className="mb-8 flex justify-center items-end gap-1">
                            <span className="text-xl font-bold text-zinc-400 mb-2">12x de R$</span>
                            <span className="font-black text-6xl text-white">29<span className="text-3xl text-zinc-400">,90</span></span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-white text-sm font-medium">Orçamentos Ilimitados</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-white text-sm font-medium">Sua Marca no PDF (Sem Zacly)</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-white text-sm font-medium">Tracking em Tempo Real</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-white text-sm font-medium">Exportação e Dashboard Pro</span>
                            </li>
                        </ul>

                        <Link href="https://app.zacly.com.br/register?plan=annual">
                            <button className="relative group w-full py-4 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-wide overflow-hidden hover:scale-[1.02] transition-transform">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative z-10">Assinar Anual</span>
                            </button>
                        </Link>
                    </motion.div>

                    {/* Monthly Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-zinc-900/40 border border-white/10 p-8 flex flex-col backdrop-blur-sm rounded-2xl"
                    >
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Pro Mensal</h3>
                            <p className="text-zinc-500 text-sm">Flexibilidade mês a mês.</p>
                        </div>

                        <div className="mb-8 flex items-end gap-1">
                            <span className="text-lg font-bold text-zinc-500 mb-1">R$</span>
                            <span className="font-black text-4xl text-white">49<span className="text-2xl text-zinc-500">,90</span></span>
                            <span className="text-sm text-zinc-500 mb-1">/mês</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-zinc-300 text-sm">Orçamentos Ilimitados</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-zinc-300 text-sm">Sua Marca no PDF</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-zinc-300 text-sm">Tracking em Tempo Real</span>
                            </li>
                        </ul>

                        <Link href="https://app.zacly.com.br/register?plan=monthly">
                            <button className="w-full py-4 rounded-xl border border-zinc-700 bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-colors">
                                Assinar Mensal
                            </button>
                        </Link>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
