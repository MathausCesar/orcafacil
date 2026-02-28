import { HeroSection } from "@/components/marketing/hero-section";
import { PainAgitationSection } from "@/components/marketing/pain-agitation-section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { PricingSection } from "@/components/marketing/pricing-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Zacly | Orçamentos Profissionais em 1 Minuto',
    description: 'A plataforma definitiva para construtores, marceneiros e profissionais cobrarem o valor justo com orçamentos digitais perfeitos. Pare de perder dinheiro no papel.',
    keywords: 'orçamento, pdf, app para autônomos, marceneiro, construtor, aplicativo de vendas, zacly',
};

export default function MarketingPage() {
    return (
        <main className="min-h-screen bg-zinc-950 flex flex-col antialiased selection:bg-emerald-500 selection:text-white font-sans text-zinc-50">
            <MarketingHeader />
            <HeroSection />
            <PainAgitationSection />
            <FeatureShowcase />
            <PricingSection />
            <MarketingFooter />
        </main>
    );
}
