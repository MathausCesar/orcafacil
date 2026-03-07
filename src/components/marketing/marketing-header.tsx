"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function MarketingHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                {/* Logo */}
                <Link href="/" className="relative flex items-center shrink-0">
                    <div className="relative h-10 w-10 sm:hidden">
                        <Image
                            src="/logo/zacly_icone.png"
                            alt="Zacly"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="relative hidden sm:block h-12 w-44">
                        <Image
                            src="/logo/logo.png"
                            alt="Zacly"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden sm:flex items-center gap-4">
                    <Link
                        href="https://app.zacly.com.br/login"
                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                        Entrar
                    </Link>
                    <Link
                        href="https://app.zacly.com.br/register"
                        className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                    >
                        Começar Grátis
                    </Link>
                </nav>

                {/* Mobile hamburger button */}
                <button
                    type="button"
                    aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="sm:hidden flex items-center justify-center h-10 w-10 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div className="sm:hidden border-t border-white/5 bg-zinc-950/95 px-4 py-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                        href="https://app.zacly.com.br/login"
                        onClick={() => setMenuOpen(false)}
                        className="w-full text-center py-3 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Entrar
                    </Link>
                    <Link
                        href="https://app.zacly.com.br/register"
                        onClick={() => setMenuOpen(false)}
                        className="w-full text-center py-3 rounded-xl text-sm font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
                    >
                        Começar Grátis →
                    </Link>
                </div>
            )}
        </header>
    );
}
