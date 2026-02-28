"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

// Keep these in sync with the JSON-LD in page.tsx
const faqs = [
    {
        question: "O que é o Zacly?",
        answer:
            "Zacly é um aplicativo para autônomos — marceneiros, mecânicos, arquitetos, confeiteiros e outros profissionais — criarem orçamentos profissionais em PDF com sua logomarca em menos de 1 minuto, sem precisar usar Word, Excel ou papel.",
    },
    {
        question: "O Zacly é gratuito?",
        answer:
            "Sim. O Zacly possui um plano gratuito com até 5 orçamentos por mês. Para orçamentos ilimitados e sua logo nos PDFs sem marca-d'água, o plano Pro custa a partir de R$ 29,90 por mês no plano anual.",
    },
    {
        question: "Como o Zacly ajuda autônomos a fecharem mais vendas?",
        answer:
            "O Zacly gera PDFs com visual profissional que passam credibilidade ao cliente. O profissional envia o link de aprovação pelo WhatsApp e o cliente pode aprovar na hora, eliminando o tempo de espera e o \"sumiço\" que é comum em orçamentos no papel.",
    },
    {
        question: "Preciso instalar algum programa para usar o Zacly?",
        answer:
            "Não. O Zacly funciona diretamente no navegador web no computador ou celular. Não é necessário instalar nenhum programa ou aplicativo.",
    },
    {
        question: "O Zacly funciona para qual tipo de profissional autônomo?",
        answer:
            "O Zacly funciona para qualquer autônomo que precisa enviar orçamentos: marceneiros, pedreiros, arquitetos, mecânicos, eletricistas, confeiteiros, fotógrafos, pintores, designers e qualquer outro profissional de serviço.",
    },
    {
        question: "Como o link de aprovação funciona?",
        answer:
            "Após criar o orçamento, o Zacly gera um link único para o cliente. Ele abre uma página com o PDF e um botão de aprovação. Quando o cliente aprova, você recebe a notificação imediatamente. Nada mais de \"vi, mas não respondi\".",
    },
];

function FaqItem({ faq, index }: { faq: (typeof faqs)[number]; index: number }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
        >
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left border-b border-white/10 hover:border-emerald-500/30 transition-colors group"
            >
                <span className="text-base md:text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                    {faq.question}
                </span>
                <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-zinc-400 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                    {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="py-5 text-zinc-400 leading-relaxed text-sm md:text-base">
                            {faq.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function FaqSection() {
    return (
        /* 
         * IMPORTANT for SEO: this section is rendered as an <section> with 
         * aria-labelledby pointing to the visible H2, giving Google and 
         * screen readers a clear structural signal. The FAQ content in 
         * JSON-LD in page.tsx matches this content exactly (FAQPage schema).
         */
        <section
            aria-labelledby="faq-heading"
            className="py-24 md:py-32 bg-zinc-950 border-t border-white/5 relative overflow-hidden"
        >
            {/* Subtle ambient glow */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-emerald-900/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 max-w-[900px] mx-auto">

                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        className="text-emerald-500 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                    >
                        Perguntas Frequentes
                    </motion.p>
                    <motion.h2
                        id="faq-heading"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-black text-white tracking-tight"
                    >
                        Tudo que você quer saber
                    </motion.h2>
                </div>

                <div role="list">
                    {faqs.map((faq, i) => (
                        <FaqItem key={i} faq={faq} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
