import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { buildZaclyOrganizationJsonLd, buildZaclyWebSiteJsonLd } from "@/lib/zacly-entity";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zacly - Orcamentos Profissionais",
    template: "%s | Zacly",
  },
  description:
    "Crie orcamentos profissionais em PDF, envie pelo WhatsApp e acompanhe a aprovacao do cliente.",
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
  keywords: [
    "orcamento",
    "proposta comercial",
    "gerador de orcamento",
    "autonomo",
    "prestador de servico",
    "pdf",
    "whatsapp",
  ],
  creator: "Zacly",
  publisher: "Zacly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.zacly.com.br"),
  openGraph: {
    title: "Zacly - Orcamentos Profissionais",
    description: "Crie orcamentos em PDF, envie pelo WhatsApp e acompanhe aprovacoes com o Zacly.",
    url: "https://www.zacly.com.br",
    siteName: "Zacly",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zacly - Orcamentos Profissionais",
    description: "Crie orcamentos profissionais em PDF pelo WhatsApp. Simples e rapido.",
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
  const jsonLd = [buildZaclyOrganizationJsonLd(), buildZaclyWebSiteJsonLd()];

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
