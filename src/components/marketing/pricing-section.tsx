"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PricingSection() {
    return (
        <section className="py-32 bg-secondary/10 relative overflow-hidden">
            {/* Diagonal Brutalist Strip */}
            <div className="absolute top-1/2 left-0 w-[200%] h-32 bg-primary/5 -rotate-[10deg] -translate-y-1/2 pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 max-w-7xl">

                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-5xl md:text-6xl font-black uppercase text-foreground mb-6"
                    >
                        PREÇOS JUSTOS. <br />
                        <span className="text-primary">RETORNO IMEDIATO.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground"
                    >
                        Um único orçamento fechado pelo Zacly já paga um ano inteiro de assinatura. Pare de pensar como amador e invista na sua empresa.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

                    {/* Free Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5 }}
                        className="bg-card border border-border p-10 flex flex-col shadow-lg"
                    >
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold uppercase text-foreground mb-2">Plano Inicial</h3>
                            <p className="text-muted-foreground">Perfeito para conhecer a ferramenta hoje mesmo.</p>
                        </div>

                        <div className="mb-8 font-black text-5xl text-foreground">
                            Grátis
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="h-6 w-6 text-primary shrink-0" />
                                <span className="text-foreground">Até 5 orçamentos p/ mês</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-6 w-6 text-primary shrink-0" />
                                <span className="text-foreground">Design Zacly (com marca-d'água)</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-50">
                                <X className="h-6 w-6 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground line-through">Sua Logomarca nos PDFs</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-50">
                                <X className="h-6 w-6 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground line-through">Cadastro Ilimitado de Clientes</span>
                            </li>
                        </ul>

                        <Link href="https://app.zacly.com.br/register" className="w-full">
                            <Button variant="outline" size="lg" className="w-full h-14 text-lg border-primary text-primary hover:bg-primary/10 rounded-none uppercase font-bold tracking-wider">
                                Começar Grátis
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-primary text-primary-foreground p-10 flex flex-col shadow-[0_0_50px_rgba(21,88,81,0.3)] relative transform md:-translate-y-4"
                    >
                        <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground font-bold px-4 py-1 text-xs uppercase tracking-widest transform rotate-45 translate-x-8 translate-y-6">
                            MARCA PRÓPRIA
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl font-bold uppercase mb-2">Zacly Pro</h3>
                            <p className="text-primary-foreground/80">O arsenal completo para quem trabalha sério.</p>
                        </div>

                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-2xl font-bold">R$</span>
                            <span className="font-black text-6xl">49</span>
                            <span className="text-primary-foreground/70">/mês</span>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            <li className="flex items-start gap-3">
                                <Check className="h-6 w-6 text-white shrink-0" />
                                <span className="font-bold">Orçamentos Ilimitados</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-6 w-6 text-white shrink-0" />
                                <span className="font-bold border-b border-primary-foreground border-dashed pb-0.5">Sem marca-d'água</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-6 w-6 text-white shrink-0" />
                                <span>Logo da SUA empresa</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="h-6 w-6 text-white shrink-0" />
                                <span>Controle de recebimentos</span>
                            </li>
                        </ul>

                        <Link href="https://app.zacly.com.br/register?plan=pro" className="w-full">
                            <Button size="lg" className="w-full h-14 text-lg bg-background text-foreground hover:bg-white shadow-xl rounded-none uppercase font-black tracking-wider">
                                Assinar o PRO
                            </Button>
                        </Link>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
