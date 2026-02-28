"use client";

import { motion } from "framer-motion";
import { Clock, Ban, Receipt, AlertTriangle } from "lucide-react";

const pains = [
    {
        icon: Clock,
        title: "Perda de Tempo Absurda",
        description: "Você chega em casa exausto e ainda precisa passar horas montando orçamentos manuais no Word ou Excel."
    },
    {
        icon: Receipt,
        title: "Visual Amador",
        description: "Orçamento de papel, foto do caderno ou PDF feio assustam clientes que pagariam mais pelo seu serviço."
    },
    {
        icon: Ban,
        title: "Esquecimento e Descontrole",
        description: "Você não lembra para quem enviou orçamento, quem aprovou e quem você precisa cobrar. Dinheiro na mesa."
    },
    {
        icon: AlertTriangle,
        title: "Margem de Erro Alta",
        description: "Somar errado os materiais na calculadora do celular significa que você vai pagar para trabalhar."
    }
];

export function PainAgitationSection() {
    return (
        <section className="py-24 bg-card relative overflow-hidden border-y border-border">
            {/* Geometric Background Slash */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/30 -skew-x-12 translate-x-1/4" />

            <div className="container relative z-10 px-4 md:px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Text Column */}
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 uppercase"
                        >
                            O PAPEL ESTÁ <br />
                            <span className="text-destructive">MATANDO</span> <br />
                            SEU LUCRO.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-xl text-muted-foreground mb-8 max-w-lg border-l-4 border-destructive pl-4"
                        >
                            O cliente de hoje exige rapidez e transparência. Se você demora dois dias para mandar um preço escrito no WhatsApp, seu concorrente já fechou o serviço.
                        </motion.p>
                    </div>

                    {/* Grid de Dores Brutalista */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pains.map((pain, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-background border border-border p-8 hover:border-destructive/50 transition-colors group relative"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-destructive scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

                                <pain.icon className="h-10 w-10 text-muted-foreground group-hover:text-destructive transition-colors mb-6" strokeWidth={1.5} />

                                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-destructive transition-colors">{pain.title}</h3>

                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {pain.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
