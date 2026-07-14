"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, TrendingDown, ReceiptText } from "lucide-react";

const pains = [
    {
        icon: Clock,
        title: "Você trabalha o dia todo e ainda tem que montar orçamento",
        desc: "Chega cansado do serviço e ainda precisa sentar pra lembrar preço, escrever tudo e responder o cliente à noite.",
    },
    {
        icon: ReceiptText,
        title: "Orçamento com cara de improviso",
        desc: "Foto do caderno ou texto corrido no WhatsApp faz o cliente olhar só o preço — e escolher o mais barato.",
    },
    {
        icon: TrendingDown,
        title: "Cliente pede desconto ou some",
        desc: "Quando o cliente não entende direito o que está pagando, ele pede desconto, enrola ou para de responder.",
    },
    {
        icon: AlertTriangle,
        title: "Serviço perdido por falta de retorno",
        desc: "Sem controle, você esquece quem ficou de responder — e o serviço vai pra outro que cobrou antes.",
    },
];

export function PainAgitationSection() {
    return (
        <section id="problema" className="py-24 md:py-32 bg-[#09090b] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />

            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-start">
                    <div className="lg:col-span-5 lg:sticky lg:top-32">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 text-white uppercase leading-[1.02]"
                        >
                            O problema não é só o preço.{" "}
                            <span className="block text-red-500">É como o preço chega.</span>
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
                            className="text-xl md:text-2xl text-zinc-300 font-light leading-relaxed"
                        >
                            Orçamento mandado de qualquer jeito faz o cliente desconfiar, pedir desconto ou sumir. Com o Zacly, ele recebe tudo organizado, entende o que está pagando e aprova mais rápido.
                        </motion.p>
                    </div>

                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {pains.map((pain, index) => (
                            <motion.div
                                key={pain.title}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-zinc-900/50 border border-white/10 p-7 group relative overflow-hidden backdrop-blur-sm transition-colors hover:bg-zinc-900/80 hover:border-red-500/30 rounded-2xl"
                            >
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />

                                <pain.icon className="h-8 w-8 text-zinc-500 group-hover:text-red-500 transition-colors mb-6" strokeWidth={1.5} />

                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-50 transition-colors">{pain.title}</h3>

                                <p className="text-zinc-400 text-sm leading-relaxed">
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
