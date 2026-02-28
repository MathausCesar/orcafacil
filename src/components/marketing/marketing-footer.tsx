"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export function MarketingFooter() {
    return (
        <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10 overflow-hidden relative">

            {/* Massive Background Text - Topological Brutalism */}
            <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.02] flex items-center justify-center -translate-y-1/4">
                <span className="text-[20vw] font-black whitespace-nowrap text-white leading-none tracking-tighter">
                    ZACLY
                </span>
            </div>

            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-block relative w-40 h-12">
                            <Image
                                src="/logo/logo.png"
                                alt="Zacly Logo"
                                fill
                                className="object-contain object-left opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </Link>
                        <p className="text-xl font-bold text-white max-w-xs uppercase tracking-tight">
                            PAREÇA GIGANTE. <br /><span className="text-emerald-500">TRABALHE SOZINHO.</span>
                        </p>
                        <p className="text-zinc-500 text-sm max-w-sm">
                            A ferramenta definitiva para autônomos que cansaram de perder orçamentos por falta de profissionalismo e lentidão no envio.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="space-y-4 pt-4 lg:pt-0">
                        <h4 className="text-sm font-bold text-white tracking-widest uppercase">Produto</h4>
                        <ul className="space-y-3">
                            <li><Link href="https://app.zacly.com.br/register" className="text-zinc-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1 group">Criar Conta Grátis <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all font-bold" /></Link></li>
                            <li><Link href="https://app.zacly.com.br/login" className="text-zinc-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1 group">Acessar Painel <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all font-bold" /></Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-zinc-600 font-medium">
                        © {new Date().getFullYear()} Zacly. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/termos" className="text-xs text-zinc-600 hover:text-white transition-colors">
                            Termos de Uso
                        </Link>
                        <Link href="/privacidade" className="text-xs text-zinc-600 hover:text-white transition-colors">
                            Políticas de Privacidade
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
