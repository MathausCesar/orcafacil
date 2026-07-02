"use client";

import { motion } from "framer-motion";
import { CreditCard, FileCheck2, Headphones, ShieldCheck, Undo2, UserCheck } from "lucide-react";

const trustItems = [
    {
        icon: CreditCard,
        title: "Pagamento pela Stripe",
        desc: "A Zacly não armazena dados do seu cartão.",
    },
    {
        icon: Undo2,
        title: "7 dias para reembolso",
        desc: "Você pode solicitar reembolso dentro do prazo legal após comprar um plano pago.",
    },
    {
        icon: ShieldCheck,
        title: "Dados protegidos",
        desc: "Conexão segura, autenticação protegida e dados tratados conforme LGPD.",
    },
    {
        icon: UserCheck,
        title: "Cliente aprova sem cadastro",
        desc: "Seu cliente abre o link, vê a proposta e aprova sem instalar nada.",
    },
    {
        icon: FileCheck2,
        title: "Sem cartão no plano grátis",
        desc: "Teste com clientes reais antes de decidir assinar.",
    },
    {
        icon: Headphones,
        title: "Suporte direto",
        desc: "Atendimento pelo e-mail suporte@zacly.com.br.",
    },
];

export function TrustSection() {
    return (
        <section className="bg-[#080b0a] py-20 md:py-28 border-y border-white/5">
            <div className="container px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-4"
                        >
                            Confiança antes da assinatura
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight"
                        >
                            Criar proposta é simples. Pagar e usar também precisa ser.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ delay: 0.2 }}
                            className="mt-5 text-base md:text-lg leading-relaxed text-zinc-300"
                        >
                            A página agora deixa claros os pontos que reduzem medo no primeiro acesso: segurança, teste grátis, aprovação do cliente e suporte.
                        </motion.p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {trustItems.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.4, delay: index * 0.04 }}
                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <item.icon className="h-6 w-6 text-emerald-300 mb-4" />
                                <h3 className="text-base font-black text-white">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
