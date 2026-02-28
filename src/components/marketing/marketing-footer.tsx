"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export function MarketingFooter() {
    return (
        <footer className="bg-background border-t border-border pt-20 pb-10 overflow-hidden relative">

            {/* Massive Background Text - Topological Brutalism */}
            <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03] flex items-center justify-center -translate-y-1/4">
                <span className="text-[15vw] font-black whitespace-nowrap text-foreground leading-none tracking-tighter">
                    ZACLY APP
                </span>
            </div>

            <div className="container relative z-10 px-4 md:px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-block">
                            <img src="/logo/zacly_icone.png" alt="Zacly Logo" className="h-10 w-10 brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
                        </Link>
                        <p className="text-xl font-bold text-foreground max-w-xs uppercase tracking-tight">
                            AGILIDADE PARA QUEM TRABALHA DURO.
                        </p>
                        <p className="text-muted-foreground text-sm max-w-sm">
                            Feito para autonomos que cansaram de perder orçamentos por falta de profissionalismo e demora no envio.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground tracking-widest uppercase">Produto</h4>
                        <ul className="space-y-3">
                            <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group">Funcionalidades <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all font-bold" /></Link></li>
                            <li><Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group">Preços <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all font-bold" /></Link></li>
                            <li><Link href="https://app.zacly.com.br/login" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group">Entrar (Login) <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all font-bold" /></Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Zacly. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/termos" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Termos de Uso
                        </Link>
                        <Link href="/privacidade" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Privacidade
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
