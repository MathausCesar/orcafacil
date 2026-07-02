import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zacly — Orçamentos Profissionais",
    template: "%s | Zacly",
  },
  description:
    "Crie orçamentos profissionais em PDF, envie pelo WhatsApp e acompanhe a aprovação do cliente.",
  applicationName: "Zacly",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Zacly",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  authors: [{ name: "Zacly" }],
  keywords: ["orçamento", "proposta comercial", "gerador de orçamento", "autônomo", "prestador de serviço", "pdf", "whatsapp"],
  creator: "Zacly",
  publisher: "Zacly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.zacly.com.br"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Zacly — Orçamentos Profissionais",
    description: "Crie orçamentos em PDF, envie pelo WhatsApp e acompanhe aprovações com o Zacly.",
    url: "https://www.zacly.com.br",
    siteName: "Zacly",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zacly — Orçamentos Profissionais",
    description: "Crie orçamentos profissionais em PDF pelo WhatsApp. Simples e rápido.",
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
  themeColor: "#165952",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Zacly",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    description: "Crie orçamentos profissionais em PDF. Ferramenta simples para autônomos e prestadores de serviço.",
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
