import { HeroSection } from "@/components/marketing/hero-section";
import { PainAgitationSection } from "@/components/marketing/pain-agitation-section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { PricingSection } from "@/components/marketing/pricing-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Zacly | Orçamentos Profissionais em 1 Minuto',
    description: 'A plataforma definitiva para construtores, marceneiros e profissionais cobrarem o valor justo com orçamentos digitais perfeitos. Pare de perder dinheiro no papel.',
    keywords: 'orçamento, pdf, app para autônomos, marceneiro, construtor, aplicativo de vendas, zacly',
};

export default function MarketingPage() {
    return (
        <main className="min-h-screen bg-zinc-950 flex flex-col antialiased selection:bg-emerald-500 selection:text-white font-sans text-zinc-50">
            {/* Minimalist Sticky Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
                <Link href="/" className="relative h-12 w-48 flex items-center">
                    <Image
                        src="/logo/logo.png"
                        alt="Zacly"
                        fill
                        className="object-contain object-left"
                    />
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="https://app.zacly.com.br/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                        Entrar
                    </Link>
                    <Link href="https://app.zacly.com.br/register">
                        <span className="text-sm font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors">
                            Começar Grátis
                        </span>
                    </Link>
                </div>
            </header>

            {/* The page composition */}
            <HeroSection />
            <PainAgitationSection />
            <FeatureShowcase />
            <PricingSection />
            <MarketingFooter />
        </main>
    );
}
