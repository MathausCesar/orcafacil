"use client";

import { motion } from "framer-motion";
import { Hammer, PlugZap, Wrench, Paintbrush, Home, Snowflake, ShieldCheck } from "lucide-react";

const professions = [
    {
        icon: Wrench,
        title: "Mecânicos",
        details: "Peças, mão de obra, prazo, garantia e aprovação antes de começar.",
    },
    {
        icon: Hammer,
        title: "Marceneiros",
        details: "Medidas, ferragens, etapas, entrada, entrega e condições em um PDF claro.",
    },
    {
        icon: PlugZap,
        title: "Eletricistas",
        details: "Visita, materiais, execução, urgência e validade do orçamento bem explicados.",
    },
    {
        icon: Paintbrush,
        title: "Pintores",
        details: "Ambientes, metragem, tinta, número de demãos, preparação e prazo.",
    },
    {
        icon: Snowflake,
        title: "Técnicos e instaladores",
        details: "Diagnóstico, deslocamento, instalação, peça, garantia e próximos passos.",
    },
    {
        icon: Home,
        title: "Reformas e manutenção",
        details: "Serviços por etapa, materiais inclusos, pagamento combinado e aceite do cliente.",
    },
];

export function ProfessionFitSection() {
    return (
        <section id="profissoes" className="bg-zinc-950 py-24 md:py-32 border-t border-white/5">
            <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                        >
                            Feito para a rotina real
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
                        >
                            Para quem precisa vender serviço, não perder tempo formatando proposta.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 text-lg leading-relaxed text-zinc-300"
                        >
                            O Zacly organiza o que o autônomo já faz todos os dias: explicar o serviço, mostrar preço, combinar prazo e conseguir o &quot;pode começar&quot;.
                        </motion.p>
                        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-left">
                            <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />
                            <p className="text-sm leading-relaxed text-emerald-50">
                                Não precisa de CNPJ, sistema complexo ou nota fiscal para começar. A proposta é ajudar quem hoje controla clientes, serviços e orçamento no papel.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {professions.map((profession, index) => (
                            <motion.div
                                key={profession.title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.45, delay: index * 0.05 }}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5"
                            >
                                <profession.icon className="h-6 w-6 text-emerald-300 mb-5" />
                                <h3 className="text-lg font-black text-white">{profession.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{profession.details}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
