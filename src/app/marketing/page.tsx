import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/hero-section";
import { PainAgitationSection } from "@/components/marketing/pain-agitation-section";
import { ProfessionFitSection } from "@/components/marketing/profession-fit-section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { LogoPersonalizationSection } from "@/components/marketing/logo-personalization-section";
import { TrustSection } from "@/components/marketing/trust-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MARKETING_COPY, PRICING, YEARLY_SAVINGS, formatCurrencyBR } from "@/lib/pricing-copy";
import { marketingFaqs } from "@/lib/marketing-faqs";
import { buildZaclyOrganizationJsonLd, ZACLY_ENTITY } from "@/lib/zacly-entity";

const BASE_URL = "https://www.zacly.com.br";

const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zacly",
    alternateName: ZACLY_ENTITY.alternateName,
    url: BASE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
        "Zacly é o app para autônomos criarem orçamentos profissionais em PDF, enviarem pelo WhatsApp e acompanharem a aprovação do cliente.",
    offers: [
        {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
            name: "Plano Básico Grátis",
            description: MARKETING_COPY.freePlan,
        },
        {
            "@type": "Offer",
            price: PRICING.monthly.toFixed(2),
            priceCurrency: "BRL",
            name: "Zacly Pro Mensal",
            description: "Orçamentos ilimitados, sua marca no PDF e acompanhamento das propostas.",
        },
        {
            "@type": "Offer",
            price: PRICING.yearly.toFixed(2),
            priceCurrency: "BRL",
            name: "Zacly Pro Anual",
            description: `Economize ${formatCurrencyBR(YEARLY_SAVINGS)} por ano. Tudo do Pro Mensal com desconto.`,
        },
    ],
    featureList: [
        "Criação de orçamentos em PDF em até 1 minuto",
        "Personalização com a marca do profissional",
        "Analise automatica da logo para sugerir a identidade visual da proposta",
        "Envio direto pelo WhatsApp",
        "Aprovação do cliente por link",
        "Acompanhamento de propostas",
        "Painel de controle de serviços",
    ],
};

const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: marketingFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
        },
    })),
};

const jsonLdOrganization = buildZaclyOrganizationJsonLd();

export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Zacly — App de Orçamentos para Autônomos | PDF pelo WhatsApp",
        template: "%s | Zacly",
    },
    description:
        "Crie orçamentos profissionais em PDF com sua marca, envie pelo WhatsApp e acompanhe a aprovação do cliente. Feito para mecânicos, marceneiros, eletricistas, pintores e prestadores autônomos.",
    keywords: [
        "app de orçamento para autônomo",
        "gerador de orçamento pdf",
        "orçamento online grátis",
        "orçamento profissional para marceneiro",
        "app de orçamento para eletricista",
        "orçamento para mecânico",
        "proposta comercial para autônomo",
        "orçamento pelo whatsapp",
        "zacly",
    ],
    authors: [{ name: "Zacly", url: BASE_URL }],
    creator: "Zacly",
    publisher: "Zacly",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: BASE_URL,
    },
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: BASE_URL,
        siteName: "Zacly",
        title: "Zacly — Orçamentos profissionais para autônomos",
        description:
            "Crie orçamento em PDF com sua marca, envie pelo WhatsApp e acompanhe a aprovação do cliente.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Zacly — Orçamentos profissionais para autônomos",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Zacly — Orçamentos profissionais pelo WhatsApp",
        description:
            "Crie orçamento em PDF com sua marca, envie pelo WhatsApp e acompanhe a aprovação do cliente.",
        images: ["/og-image.png"],
    },
};

export default function MarketingPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
            />

            <main
                id="main-content"
                className="min-h-screen bg-zinc-950 flex flex-col antialiased selection:bg-emerald-500 selection:text-white font-sans text-zinc-50"
            >
                <MarketingHeader />
                <HeroSection />
                <PainAgitationSection />
                <ProfessionFitSection />
                <LogoPersonalizationSection />
                <FeatureShowcase />
                <TrustSection />
                <PricingSection />
                <FaqSection />
                <MarketingFooter />
            </main>
        </>
    );
}
