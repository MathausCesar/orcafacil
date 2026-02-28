"use client";

import { motion } from "framer-motion";
import { CheckCircle2, CopyPlus, LayoutTemplate, Send, Activity, Settings2 } from "lucide-react";

const features = [
    {
        title: "Onboarding Mágico",
        description: "Você faz o cadastro e o Zacly importa seus produtos e serviços automaticamente. Suba sua logo e o sistema faz o resto.",
        icon: CopyPlus,
        highlight: "Segundos, não horas."
    },
    {
        title: "3 Layouts Premium com sua Logo",
        description: "Esqueça perder tempo formatando PDFs. O app gera instantaneamente propostas com a cara da sua empresa, prontas para impressionar.",
        icon: LayoutTemplate,
        highlight: "Pareça 10x maior."
    },
    {
        title: "Envio em 2 Cliques",
        description: "Com o orçamento pronto, clique em enviar e um resumo perfeito, com link de aprovação, é gerado direto para o WhatsApp do seu cliente.",
        icon: Send,
        highlight: "Integração direta."
    },
    {
        title: "Tracking em Tempo Real",
        description: "O link que o cliente recebe tem uma Linha do Tempo ao vivo. Saiba quando ele abriu, aprovação instantânea e atualize os passos (Ex: \"Em Execução\", \"Concluído\").",
        icon: Activity,
        highlight: "Fim do vácuo."
    },
    {
        title: "Dashboard de Controle",
        description: "Dashboard inteligente com cards de resumo. Acompanhe em tempo real: propostas em análise, serviços aprovados, em execução e concluídos.",
        icon: Settings2,
        highlight: "Visão de negócio."
    }
];

export function FeatureShowcase() {
    return (
        <section className="py-32 bg-zinc-950 relative border-b border-white/5 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[600px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto">

                {/* Section Header */}
                <div className="flex flex-col items-center text-center mb-24 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold tracking-widest uppercase text-xs"
                    >
                        O LOOP DE FECHAMENTO
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8"
                    >
                        Como o Zacly transforma orçamentos em <span className="text-emerald-500">dinheiro no bolso.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-3xl"
                    >
                        Nós desenhamos a trilha exata para você sair do "vou pensar" para o "pode começar amanhã". Sem fricção. Sem planilhas confusas.
                    </motion.p>
                </div>

                {/* Features Flow - Steps Timeline */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Continuous vertical line */}
                    <div className="absolute left-[28px] md:left-[50%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent -translate-x-1/2" />

                    <div className="space-y-16 lg:space-y-24">
                        {features.map((feature, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <div key={index} className="relative flex flex-col md:flex-row items-start md:items-center w-full group">

                                    {/* Left Content (or right on mobile) */}
                                    <div className={`w-full md:w-1/2 flex pl-16 md:pl-0 ${isEven ? 'md:justify-end md:pr-16 text-left md:text-right' : 'md:justify-start md:pl-16 md:order-last'}`}>
                                        <motion.div
                                            initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.6 }}
                                            className="max-w-md w-full relative"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-xl rounded-full -z-10" />
                                            <span className="text-emerald-500 text-sm font-bold uppercase tracking-wider mb-2 block">{feature.highlight}</span>
                                            <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                                                {feature.title}
                                            </h3>
                                            <p className="text-zinc-400 leading-relaxed font-light text-sm md:text-base">
                                                {feature.description}
                                            </p>
                                        </motion.div>
                                    </div>

                                    {/* Center Node */}
                                    <div className="absolute left-[28px] md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 w-14 h-14 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center z-10 transition-colors duration-500 group-hover:border-emerald-500/50 group-hover:bg-emerald-950/30">
                                        <div className="absolute inset-0 rounded-full bg-emerald-500/20 scale-0 group-hover:scale-150 transition-transform duration-500 blur-md opacity-0 group-hover:opacity-100" />
                                        <div className="bg-zinc-900 w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            <feature.icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                    </div>

                                    {/* Empty structural div for alternating layout */}
                                    <div className={`hidden md:block w-1/2 ${isEven ? 'order-last' : ''}`} />

                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}
