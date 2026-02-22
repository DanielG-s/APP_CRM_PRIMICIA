import LayoutWrapper from "./components/LayoutWrapper";
import JsonLd from "../components/JsonLd";
import "./globals.css";

import { API_BASE_URL } from "@/lib/config";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

export const metadata: Metadata = {
  title: {
    default: "Merxios CRM - Dashboard de Performance",
    template: "%s | Merxios CRM",
  },
  description: "Dashboard de performance comercial e gestão de relacionamento com o cliente.",
  metadataBase: new URL(API_BASE_URL),
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-BR">
        <body>
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
        </body>
      </html>
    </ClerkProvider>
  );
}