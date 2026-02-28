"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, FileText, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background pt-20 pb-16">
            {/* Dark Mode Grain Overlay for texture (Brutalist aspect) */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            {/* Asymmetric / Brutalist Background Elements */}
            <div className="absolute top-0 right-0 w-full md:w-[60vw] h-[70vh] bg-gradient-to-bl from-primary/10 to-transparent blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full md:w-[40vw] h-[50vh] bg-gradient-to-tr from-accent/5 to-transparent blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 max-w-[1400px]">
                <div className="flex flex-col items-start text-left max-w-5xl mx-auto lg:mx-0">

                    {/* Eyebrow Label */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border/50 text-emerald-400 text-sm font-medium mb-8 uppercase tracking-wider"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Para Autônomos Exigentes
                    </motion.div>

                    {/* Massive Typography - Asymmetric Split */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                        className="text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[0.9] text-foreground mb-6"
                    >
                        PARE DE PERDER <br />
                        <span className="text-secondary-foreground">DINHEIRO NO</span> <br />
                        <span className="text-primary italic pr-2">PAPEL.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed mb-10 border-l-4 border-accent pl-6"
                    >
                        Orçamentos em papel ou Word demoram e não passam credibilidade. O Zacly gera PDFs perfeitos em 1 minuto que seus clientes aprovam na hora.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
                    >
                        <Link href="https://app.zacly.com.br/register" className="w-full sm:w-auto">
                            {/* Aggressive CTA with Spring hover */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    size="lg"
                                    className="h-16 px-10 text-xl font-bold w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_40px_rgba(21,88,81,0.4)] border-none uppercase tracking-wide rounded-none" // Brutalist sharp edges
                                >
                                    Começar Grátis Agora
                                    <ArrowRight className="ml-3 h-6 w-6 stroke-[3]" />
                                </Button>
                            </motion.div>
                        </Link>

                        <p className="text-sm text-muted-foreground sm:ml-4 font-medium">
                            Sem cartão de crédito. <br className="hidden sm:block" />
                            5 orçamentos grátis.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Floating UI Elements (Topological Brutalism) */}
            <motion.div
                initial={{ opacity: 0, x: 100, rotate: 10 }}
                animate={{ opacity: 1, x: 0, rotate: -5 }}
                transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 50 }}
                className="hidden lg:flex absolute top-1/4 right-[5%] w-80 h-48 bg-card border border-border shadow-2xl p-6 flex-col justify-between -z-0"
            >
                <div className="flex justify-between items-start">
                    <FileText className="h-8 w-8 text-destructive" />
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded">RECUSADO</span>
                </div>
                <div>
                    <div className="h-2 w-3/4 bg-muted mb-2 rounded" />
                    <div className="h-2 w-1/2 bg-muted rounded" />
                </div>
                <div className="text-4xl font-black text-muted-foreground/30 line-through">R$ 4.500</div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 100, rotate: -10 }}
                animate={{ opacity: 1, y: 0, rotate: 5 }}
                transition={{ duration: 1, delay: 0.7, type: "spring", stiffness: 50 }}
                className="hidden lg:flex absolute bottom-1/4 right-[15%] w-96 h-56 bg-primary border-none shadow-[0_0_60px_rgba(21,88,81,0.5)] p-6 flex-col justify-between z-20"
            >
                <div className="flex justify-between items-start">
                    <img src="/logo/zacly_icone.png" alt="Zacly" className="h-10 w-10 brightness-0 invert" />
                    <span className="text-xs font-bold text-primary-foreground bg-white/20 px-2 py-1 rounded backdrop-blur">APROVADO NA HORA</span>
                </div>
                <div>
                    <div className="h-2 w-full bg-white/20 mb-2 rounded" />
                    <div className="h-2 w-4/5 bg-white/20 mb-2 rounded" />
                    <div className="h-2 w-2/3 bg-white/20 rounded" />
                </div>
                <div className="flex items-end justify-between">
                    <div className="text-5xl font-black text-primary-foreground">R$ 5.200</div>
                    <ArrowRight className="h-8 w-8 text-primary-foreground mb-1" />
                </div>
            </motion.div>
        </section>
    );
}
