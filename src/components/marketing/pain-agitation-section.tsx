"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, TrendingDown, ReceiptText } from "lucide-react";

export function PainAgitationSection() {
    return (
        <section className="py-32 bg-[#09090b] relative overflow-hidden">
            {/* Top divider */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />

            {/* Geometric Background Slash */}
            <div className="absolute top-0 right-0 w-3/4 h-[800px] bg-red-950/10 -skew-x-12 translate-x-1/3 pointer-events-none blur-[100px]" />

            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start">

                    {/* Left Column: The Problem Statement (5 columns) */}
                    <div className="lg:col-span-5 sticky top-32">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-8 text-white uppercase leading-[0.95]"
                        >
                            O <span className="text-red-500">amadorismo</span><br />
                            custa caro.
                        </motion.h2>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="w-16 h-1 bg-red-500 mb-8"
                        />

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl md:text-2xl text-zinc-400 font-light leading-relaxed"
                        >
                            O cliente julga a sua capacidade técnica pela organização do seu orçamento. Mandar um texto solto no WhatsApp ou um arquivo do Excel desconfigurado é o atalho mais rápido para tomar um "Vou dar uma olhadinha e te aviso".
                        </motion.p>
                    </div>

                    {/* Right Column: The Pains (7 columns) */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            {
                                icon: Clock,
                                title: "Horas Perdidas",
                                desc: "Chegar exausto do trabalho e ainda precisar sentar para montar orçamentos manualmente."
                            },
                            {
                                icon: ReceiptText,
                                title: "Visual Pobre",
                                desc: "Você perde serviços para concorrentes piores apenas porque o PDF deles tem logo e parece de 'empresa grande'."
                            },
                            {
                                icon: TrendingDown,
                                title: "Preço Questionado",
                                desc: "Um orçamento desorganizado convida o cliente a pedir desconto, pois não passa percepção de valor."
                            },
                            {
                                icon: AlertTriangle,
                                title: "Descontrole Total",
                                desc: "Esquecer quem aprovou, quem não respondeu, e deixar dinheiro na mesa por falta de acompanhamento."
                            }
                        ].map((pain, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-zinc-900/40 border border-white/5 p-8 group relative overflow-hidden backdrop-blur-sm transition-colors hover:bg-zinc-900/80 hover:border-red-500/30"
                            >
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />

                                <pain.icon className="h-8 w-8 text-zinc-600 group-hover:text-red-500 transition-colors mb-6" strokeWidth={1.5} />

                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-50 transition-colors">{pain.title}</h3>

                                <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                                    {pain.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
