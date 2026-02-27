import LayoutWrapper from "./components/LayoutWrapper";
import { ThemeProvider } from "./components/ThemeProvider";
import JsonLd from "../components/JsonLd";
import "./globals.css";

import { API_BASE_URL } from "@/lib/config";
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Merxios CRM - Dashboard de Performance",
    template: "%s | Merxios CRM",
  },
  description: "Dashboard de performance comercial e gestão de relacionamento com o cliente.",
  metadataBase: new URL(API_BASE_URL),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Merxios",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Merxios CRM",
    description: "Dashboard de performance comercial e gestão de relacionamento.",
    url: API_BASE_URL,
    siteName: "Merxios CRM",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merxios CRM",
    description: "Dashboard de performance comercial.",
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
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR" suppressHydrationWarning>
        <head>
          <meta name="mobile-web-app-capable" content="yes" />
          {/* Service Worker Registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                  });
                }
              `,
            }}
          />
        </head>
        <body className="bg-background text-foreground transition-colors duration-300">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <JsonLd
              data={{
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Merxios CRM",
                url: API_BASE_URL,
                logo: `${API_BASE_URL}/logo.png`,
                sameAs: [
                  "https://www.facebook.com/merxios",
                  "https://twitter.com/merxios",
                  "https://www.linkedin.com/company/merxios",
                ],
              }}
            />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
