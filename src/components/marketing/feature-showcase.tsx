"use client";

import { motion } from "framer-motion";
import { CopyPlus, LayoutTemplate, Send, Activity, Settings2 } from "lucide-react";

const features = [
    {
        title: "Comece com seus serviços prontos",
        description: "No cadastro, o Zacly sugere produtos e serviços coerentes com o seu ofício para você não partir de uma tela vazia.",
        icon: CopyPlus,
        highlight: "Menos digitação.",
    },
    {
        title: "Modelos profissionais com sua marca",
        description: "Escolha um modelo de proposta e mantenha a identidade visual organizada, sem virar bagunça de cores e fontes.",
        icon: LayoutTemplate,
        highlight: "Cara de empresa.",
    },
    {
        title: "Envio pelo WhatsApp em poucos cliques",
        description: "O app prepara um resumo com link de aprovação para você mandar ao cliente sem copiar texto manualmente.",
        icon: Send,
        highlight: "Resposta rápida.",
    },
    {
        title: "Cliente aprova pelo link",
        description: "O cliente vê a proposta, entende o escopo e aprova sem instalar aplicativo e sem depender de conversa perdida.",
        icon: Activity,
        highlight: "Próximo passo claro.",
    },
    {
        title: "Painel para acompanhar tudo",
        description: "Veja orçamentos em análise, aprovados, em execução e concluídos para saber onde está cada oportunidade.",
        icon: Settings2,
        highlight: "Controle simples.",
    },
];

export function FeatureShowcase() {
    return (
        <section id="como-funciona" className="py-24 md:py-32 bg-zinc-950 relative border-b border-white/5 overflow-hidden">
            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="flex flex-col items-center text-center mb-20 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-bold tracking-widest uppercase text-xs"
                    >
                        Orçamento Vivo Zacly
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-8"
                    >
                        Do orçamento improvisado ao <span className="text-emerald-500">serviço aprovado.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-300 text-lg md:text-xl font-light leading-relaxed max-w-3xl"
                    >
                        Um PDF comum fica perdido no WhatsApp. O Zacly cria a proposta, entrega um link de aprovação e mostra o andamento até o serviço sair do papel.
                    </motion.p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/25 to-transparent -translate-x-1/2" />

                    <div className="space-y-14 lg:space-y-20">
                        {features.map((feature, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <div key={feature.title} className="relative flex flex-col md:flex-row items-start md:items-center w-full group">
                                    <div className={`w-full md:w-1/2 flex pl-16 md:pl-0 ${isEven ? "md:justify-end md:pr-16 text-left md:text-right" : "md:justify-start md:pl-16 md:order-last"}`}>
                                        <motion.div
                                            initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.6 }}
                                            className="max-w-md w-full relative"
                                        >
                                            <span className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2 block">{feature.highlight}</span>
                                            <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                                                {feature.title}
                                            </h3>
                                            <p className="text-zinc-300 leading-relaxed font-light text-sm md:text-base">
                                                {feature.description}
                                            </p>
                                        </motion.div>
                                    </div>

                                    <div className="absolute left-[28px] md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 -translate-y-1/2 md:translate-y-0 w-14 h-14 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center z-10 transition-colors duration-500 group-hover:border-emerald-500/50 group-hover:bg-emerald-950/30">
                                        <div className="bg-zinc-900 w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            <feature.icon className="w-5 h-5 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                    </div>

                                    <div className={`hidden md:block w-1/2 ${isEven ? "order-last" : ""}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
