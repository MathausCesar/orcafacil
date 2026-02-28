"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-zinc-950 pt-32 pb-20">
            {/* Deep Atmosphere Engine */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-teal-900/20 blur-[150px] rounded-full pointer-events-none translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-emerald-400/5 blur-[100px] rounded-full pointer-events-none translate-x-1/3" />

            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto text-center flex flex-col items-center">

                {/* Micro-Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-white/5 text-zinc-300 text-xs font-bold mb-8 uppercase tracking-[0.2em] backdrop-blur-sm"
                >
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    O fim do Word e Excel
                </motion.div>

                {/* Massive Typographic Brutalism */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-black tracking-tighter leading-[0.95] text-white mb-8 max-w-5xl"
                >
                    Pareça uma empresa gigante, <br className="hidden md:block" />
                    mesmo trabalhando <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">sozinho.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-lg md:text-2xl text-zinc-400 max-w-2xl font-light leading-relaxed mb-12"
                >
                    Crie orçamentos impecáveis com a sua logo em 1 minuto. Envie pelo WhatsApp e seja aprovado na hora.
                </motion.p>

                {/* Aggressive CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-4 w-full sm:w-auto relative"
                >
                    {/* Glow behind button */}
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-110"></div>

                    <Link href="https://app.zacly.com.br/register" className="w-full sm:w-auto relative z-10">
                        <button className="group relative h-16 px-10 rounded-full bg-white text-black font-bold text-lg flex items-center justify-center gap-3 overflow-hidden transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
                            <span>Testar Gratuitamente</span>
                            <div className="bg-black/10 rounded-full p-1.5 transition-transform group-hover:translate-x-1">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </button>
                    </Link>

                    <p className="text-sm text-zinc-500 font-medium mt-4">
                        Sem cartão de crédito. Leva 30 segundos.
                    </p>
                </motion.div>

            </div>

            {/* Fading bottom edge to connect to next section softly */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none"></div>
        </section>
    );
}
