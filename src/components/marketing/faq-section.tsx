"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { marketingFaqs } from "@/lib/marketing-faqs";

function FaqItem({ faq, index }: { faq: (typeof marketingFaqs)[number]; index: number }) {
    const [open, setOpen] = useState(false);
    const answerId = useId();

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
                aria-controls={answerId}
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-start justify-between gap-6 rounded-xl px-3 py-6 text-left border-b border-white/10 hover:border-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 transition-colors group"
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
                        id={answerId}
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="px-3 py-5 text-zinc-300 leading-relaxed text-sm md:text-base">
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
        <section
            id="faq"
            aria-labelledby="faq-heading"
            className="py-24 md:py-32 bg-zinc-950 border-t border-white/5 relative overflow-hidden"
        >
            <div className="container relative z-10 px-4 md:px-6 max-w-[900px] mx-auto">
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        className="text-emerald-500 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                    >
                        Perguntas frequentes
                    </motion.p>
                    <motion.h2
                        id="faq-heading"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-black text-white tracking-tight"
                    >
                        Antes de criar sua conta
                    </motion.h2>
                </div>

                <div role="list">
                    {marketingFaqs.map((faq, i) => (
                        <FaqItem key={faq.question} faq={faq} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
