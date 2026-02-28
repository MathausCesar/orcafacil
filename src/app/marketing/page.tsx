import { HeroSection } from "@/components/marketing/hero-section";
import { PainAgitationSection } from "@/components/marketing/pain-agitation-section";
import { FeatureShowcase } from "@/components/marketing/feature-showcase";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import type { Metadata } from 'next';

const BASE_URL = "https://zacly.com.br";

// ─── JSON-LD Structured Data ────────────────────────────────────────────────
const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zacly",
    url: BASE_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description:
        "Zacly é o app para autônomos criarem orçamentos profissionais em PDF com sua logo em menos de 1 minuto, enviarem pelo WhatsApp e acompanharem a aprovação do cliente em tempo real.",
    offers: [
        {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
            name: "Plano Básico Grátis",
            description: "5 orçamentos por mês sem custo.",
        },
        {
            "@type": "Offer",
            price: "49.90",
            priceCurrency: "BRL",
            priceSpecification: {
                "@type": "UnitPriceSpecification",
                billingIncrement: 1,
                unitCode: "MON",
            },
            name: "Zacly Pro Mensal",
            description: "Orçamentos ilimitados, sua logomarca, sem marca-d'água.",
        },
        {
            "@type": "Offer",
            price: "358.80",
            priceCurrency: "BRL",
            name: "Zacly Pro Anual",
            description: "Economize R$ 240 por ano. Tudo do Pro Mensal com desconto.",
        },
    ],
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "312",
    },
    featureList: [
        "Criação de orçamentos em PDF em 1 minuto",
        "Personalização com logomarca do profissional",
        "Envio direto pelo WhatsApp",
        "Aprovação do cliente com link interativo",
        "Tracking em tempo real da proposta",
        "Dashboard de controle de serviços",
    ],
};

const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "O que é o Zacly?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Zacly é um aplicativo para autônomos — marceneiros, mecânicos, arquitetos, confeiteiros e outros profissionais — criarem orçamentos profissionais em PDF com sua logomarca em menos de 1 minuto, sem precisar usar Word, Excel ou papel.",
            },
        },
        {
            "@type": "Question",
            name: "O Zacly é gratuito?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Sim. O Zacly possui um plano gratuito com até 5 orçamentos por mês. Para orçamentos ilimitados e sua logo nos PDFs sem marca-d'água, o plano Pro custa a partir de R$ 29,90 por mês no plano anual.",
            },
        },
        {
            "@type": "Question",
            name: "Como o Zacly ajuda autônomos a fecharem mais vendas?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "O Zacly gera PDFs com visual profissional que passam credibilidade ao cliente. O profissional envia o link de aprovação pelo WhatsApp e o cliente pode aprovar na hora, eliminando o tempo de espera e o 'sumiço' que é comum em orçamentos no papel.",
            },
        },
        {
            "@type": "Question",
            name: "Preciso instalar algum programa para usar o Zacly?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Não. O Zacly funciona diretamente no navegador web no computador ou celular. Não é necessário instalar nenhum programa ou aplicativo.",
            },
        },
        {
            "@type": "Question",
            name: "O Zacly funciona para qual tipo de profissional autônomo?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "O Zacly funciona para qualquer autônomo que precisa enviar orçamentos: marceneiros, pedreiros, arquitetos, mecânicos, eletricistas, confeiteiros, fotógrafos, pintores, designers e qualquer outro profissional de serviço.",
            },
        },
    ],
};

const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zacly",
    url: BASE_URL,
    potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
    },
};

// ─── Metadata Export ─────────────────────────────────────────────────────────
export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
        default: "Zacly — App de Orçamentos para Autônomos | PDFs Profissionais em 1 Minuto",
        template: "%s | Zacly",
    },
    description:
        "Crie orçamentos profissionais em PDF com sua logomarca em menos de 1 minuto. Marceneiros, mecânicos, arquitetos e autônomos usam o Zacly para fechar mais vendas pelo WhatsApp.",
    keywords: [
        "app de orçamento para autônomo",
        "criar orçamento em pdf",
        "orçamento profissional para marceneiro",
        "orçamento para autônomo",
        "app orçamento online grátis",
        "proposta comercial autônomo",
        "orçamento pdf whatsapp",
        "zacly",
        "app de orçamentos",
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
        title: "Zacly — App de Orçamentos para Autônomos | PDFs Profissionais em 1 Minuto",
        description:
            "Crie orçamentos com sua logo em 1 minuto. Envie pelo WhatsApp e seja aprovado na hora. Grátis para começar.",
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
        site: "@zaclybr",
        creator: "@zaclybr",
        title: "Zacly — Orçamentos Profissionais em 1 Minuto",
        description:
            "Crie orçamentos com sua logo em 1 minuto. Envie pelo WhatsApp e seja aprovado na hora. Grátis para começar.",
        images: ["/og-image.png"],
    },
};

// ─── Page Component ───────────────────────────────────────────────────────────
export default function MarketingPage() {
    return (
        <>
            {/* JSON-LD Structured Data — Critical for rich results and AI citation */}
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
            />

            <main
                id="main-content"
                className="min-h-screen bg-zinc-950 flex flex-col antialiased selection:bg-emerald-500 selection:text-white font-sans text-zinc-50"
            >
                <MarketingHeader />

                {/* ── Hero: Primary Keyword Region ─────────────────────── */}
                <HeroSection />

                {/* ── Problem: Pain Agitation ───────────────────────────── */}
                <PainAgitationSection />

                {/* ── Product: Feature Flow ─────────────────────────────── */}
                <FeatureShowcase />

                {/* ── Conversion: Pricing ───────────────────────────────── */}
                <PricingSection />

                {/* ── GEO/AI: FAQ for citations ─────────────────────────── */}
                <FaqSection />

                <MarketingFooter />
            </main>
        </>
    );
}
