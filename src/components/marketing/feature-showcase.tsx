"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Zap } from "lucide-react";

const features = [
    {
        title: "Monte Seu Orçamento em 1 Minuto",
        description: "Adicione seus serviços e materiais no app. O Zacly calcula o total e a sua margem de lucro, sem erro de matemática.",
        image: "/logo/zacly_icone.png" // Placeholder to simulate the UI
    },
    {
        title: "Envie um PDF Profissional",
        description: "Compartilhe direto no WhatsApp do cliente um PDF impecável com sua logo, cores e descrição clara do serviço.",
        image: "/logo/zacly_icone.png"
    },
    {
        title: "Acompanhe e Feche Vendas",
        description: "Saiba quem visualizou, quem aprovou e organize os pagamentos em um painel que funciona direto no celular.",
        image: "/logo/zacly_icone.png"
    }
];

export function FeatureShowcase() {
    return (
        <section className="py-32 bg-background relative border-b border-border">
            <div className="container px-4 md:px-6 max-w-7xl">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className="inline-flex items-center gap-2 mb-6"
                        >
                            <Zap className="h-6 w-6 text-primary fill-primary/20" />
                            <span className="text-primary font-bold tracking-widest uppercase text-sm">O FLUXO DE VENDAS ZACLY</span>
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black uppercase text-foreground leading-[0.9]"
                        >
                            Profissionalismo que<br /> <span className="text-secondary-foreground italic">justifica seu preço.</span>
                        </motion.h2>
                    </div>

                    <motion.p
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg max-w-sm"
                    >
                        Não perca mais tempo. O fluxo do Zacly é construído para quem trabalha na rua e precisa de agilidade.
                    </motion.p>
                </div>

                {/* Features Flow */}
                <div className="space-y-32">
                    {features.map((feature, index) => (
                        <div key={index} className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>

                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
                                className="flex-1 space-y-8"
                            >
                                <div className="text-8xl font-black text-secondary/30 -mb-10 pointer-events-none">
                                    0{index + 1}
                                </div>
                                <h3 className="text-4xl md:text-5xl font-bold text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>

                                <ul className="space-y-4 pt-4">
                                    <li className="flex items-center gap-3 text-foreground font-medium">
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                        Feito para celular
                                    </li>
                                    <li className="flex items-center gap-3 text-foreground font-medium">
                                        <CheckCircle2 className="h-6 w-6 text-primary" />
                                        Design impressionante
                                    </li>
                                </ul>
                            </motion.div>

                            {/* Visual Asset (Simulated UI) */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: index % 2 === 0 ? 5 : -5 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, type: "spring" }}
                                className="flex-1 w-full max-w-lg aspect-[4/5] bg-card border border-border shadow-2xl relative flex items-center justify-center p-8 group"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

                                {/* Placeholder App Visual */}
                                <div className="absolute inset-4 border border-border/50 bg-background/50 flex flex-col p-6 overflow-hidden">
                                    <div className="flex items-center justify-between mb-8 opacity-50">
                                        <div className="h-4 w-1/3 bg-muted rounded" />
                                        <div className="h-8 w-8 bg-muted rounded-full" />
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-16 w-full bg-card border border-border rounded flex items-center px-4 justify-between transform transition-transform group-hover:translate-y-[-5px]" style={{ transitionDelay: `${i * 100}ms` }}>
                                                <div className="space-y-2">
                                                    <div className="h-3 w-24 bg-muted rounded" />
                                                    <div className="h-2 w-16 bg-muted/50 rounded" />
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <img src={feature.image} alt={feature.title} className="h-32 w-32 drop-shadow-2xl z-10 brightness-0 invert opacity-10 group-hover:opacity-100 group-hover:invert-0 transition-all duration-500" />
                            </motion.div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
