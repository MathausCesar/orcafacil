"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { MARKETING_LINKS } from "@/lib/marketing-links";

export function MarketingFooter() {
    return (
        <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none opacity-[0.02] flex items-center justify-center -translate-y-1/4">
                <span className="text-[20vw] font-black whitespace-nowrap text-white leading-none tracking-tight">
                    ZACLY
                </span>
            </div>

            <div className="container relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-block relative w-40 h-12" aria-label="Pagina inicial da Zacly">
                            <Image
                                src="/logo/logo.png"
                                alt="Zacly Logo"
                                fill
                                sizes="160px"
                                className="object-contain object-left opacity-90 hover:opacity-100 transition-opacity"
                            />
                        </Link>
                        <p className="text-xl font-bold text-white max-w-sm uppercase tracking-tight">
                            Orcamento com cara profissional.
                            <br /><span className="text-emerald-500">Rotina simples para quem trabalha sozinho.</span>
                        </p>
                        <p className="text-zinc-400 text-sm max-w-sm">
                            Para autonomos e prestadores que querem sair do papel, do texto solto no WhatsApp e da planilha improvisada.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4 lg:pt-0">
                        <h4 className="text-sm font-bold text-white tracking-widest uppercase">Produto</h4>
                        <ul className="space-y-3">
                            <li><FooterLink href={MARKETING_LINKS.register}>Criar orcamento gratis</FooterLink></li>
                            <li><FooterLink href={MARKETING_LINKS.login}>Acessar painel</FooterLink></li>
                            <li><FooterLink href={MARKETING_LINKS.resourcesPage}>Recursos</FooterLink></li>
                            <li><FooterLink href={MARKETING_LINKS.pricingPage}>Ver planos</FooterLink></li>
                        </ul>
                    </div>

                    <div className="space-y-4 pt-4 lg:pt-0">
                        <h4 className="text-sm font-bold text-white tracking-widest uppercase">Aprenda</h4>
                        <ul className="space-y-3">
                            <li><PlainFooterLink href={MARKETING_LINKS.howItWorksPage}>Como funciona</PlainFooterLink></li>
                            <li><PlainFooterLink href={MARKETING_LINKS.modelsPage}>Modelos de orcamento</PlainFooterLink></li>
                            <li><PlainFooterLink href={MARKETING_LINKS.blogPage}>Guias para autonomos</PlainFooterLink></li>
                            <li><PlainFooterLink href="/c/mecanicos">Para mecanicos</PlainFooterLink></li>
                            <li><PlainFooterLink href="/c/marceneiros">Para marceneiros</PlainFooterLink></li>
                            <li><PlainFooterLink href="/c/eletricistas">Para eletricistas</PlainFooterLink></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-zinc-600 font-medium">
                        © {new Date().getFullYear()} Zacly. Todos os direitos reservados.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        <Link href={MARKETING_LINKS.aboutPage} className="text-xs text-zinc-600 hover:text-white transition-colors">
                            Sobre
                        </Link>
                        <Link href={MARKETING_LINKS.contactPage} className="text-xs text-zinc-600 hover:text-white transition-colors">
                            Contato
                        </Link>
                        <Link href="/termos-de-uso" className="text-xs text-zinc-600 hover:text-white transition-colors">
                            Termos de uso
                        </Link>
                        <Link href="/politica-de-privacidade" className="text-xs text-zinc-600 hover:text-white transition-colors">
                            Politica de privacidade
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="text-zinc-400 hover:text-emerald-400 transition-colors text-sm flex items-center gap-1 group">
            {children}
            <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all font-bold" />
        </Link>
    );
}

function PlainFooterLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="text-zinc-400 hover:text-emerald-400 transition-colors text-sm">
            {children}
        </Link>
    );
}
