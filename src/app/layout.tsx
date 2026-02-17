import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OrçaFácil — Orçamentos Profissionais",
    template: "%s | OrçaFácil",
  },
  description:
    "Crie orçamentos profissionais em segundos. A ferramenta ideal para autônomos e pequenos negócios gerarem propostas irresistíveis.",
  applicationName: "OrçaFácil",
  authors: [{ name: "Mathaus Cesar" }],
  keywords: ["orçamento", "proposta comercial", "gerador de orçamento", "autônomo", "freelancer", "pdf", "gestão financeira"],
  creator: "Mathaus Cesar",
  publisher: "OrçaFácil",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.orcafacil.com.br"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OrçaFácil — Orçamentos Profissionais",
    description: "Crie orçamentos, emita PDFs e conquiste mais clientes com o OrçaFácil.",
    url: "https://www.orcafacil.com.br",
    siteName: "OrçaFácil",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OrçaFácil — Orçamentos Profissionais",
    description: "Crie orçamentos profissionais em segundos. Simples e rápido.",
  },
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
};

export const viewport: Viewport = {
  themeColor: "#0D9B5C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OrçaFácil",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL",
    },
    "description": "Crie orçamentos profissionais em segundos. Ferramenta simples para autônomos.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "120",
    },
  };

  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
