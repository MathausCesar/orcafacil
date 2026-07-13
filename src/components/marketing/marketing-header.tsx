"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { MARKETING_LINKS } from "@/lib/marketing-links";
import { CampaignRegisterLink } from "@/components/marketing/campaign-register-link";

const navItems = [
    { href: MARKETING_LINKS.resourcesPage, label: "Recursos" },
    { href: MARKETING_LINKS.howItWorksPage, label: "Como funciona" },
    { href: MARKETING_LINKS.modelsPage, label: "Modelos" },
    { href: MARKETING_LINKS.blogPage, label: "Guias" },
    { href: MARKETING_LINKS.pricingPage, label: "Planos" },
];

export function MarketingHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/88 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                <Link href="/" className="relative flex items-center shrink-0" aria-label="Pagina inicial da Zacly">
                    <div className="relative h-10 w-10 sm:hidden">
                        <Image
                            src="/logo/zacly_icone.png"
                            alt="Zacly"
                            fill
                            sizes="40px"
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="relative hidden sm:block h-12 w-44">
                        <Image
                            src="/logo/logo.png"
                            alt="Zacly"
                            fill
                            sizes="176px"
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-6" aria-label="Navegacao principal">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <nav className="hidden sm:flex items-center gap-3" aria-label="Acesso ao app">
                    <Link
                        href={MARKETING_LINKS.login}
                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                        Entrar
                    </Link>
                    <CampaignRegisterLink
                        campaign="homepage_header"
                        nextPath="/onboarding"
                        className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                    >
                        Criar orcamento gratis
                    </CampaignRegisterLink>
                </nav>

                <button
                    type="button"
                    aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="sm:hidden flex items-center justify-center h-10 w-10 rounded-lg text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {menuOpen && (
                <div className="sm:hidden border-t border-white/10 bg-zinc-950/98 px-4 py-4 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="w-full py-3 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 my-1" />
                    <Link
                        href={MARKETING_LINKS.login}
                        onClick={() => setMenuOpen(false)}
                        className="w-full py-3 rounded-xl text-sm font-medium text-zinc-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        Entrar
                    </Link>
                    <CampaignRegisterLink
                        campaign="homepage_header_mobile"
                        nextPath="/onboarding"
                        onClick={() => setMenuOpen(false)}
                        className="w-full text-center py-3 rounded-xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
                    >
                        Criar orcamento gratis
                    </CampaignRegisterLink>
                </div>
            )}
        </header>
    );
}
