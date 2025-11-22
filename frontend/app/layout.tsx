import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ESTA LINHA É OBRIGATÓRIA! SEM ELA FICA TUDO BRANCO.

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Primícia CRM",
  description: "Sistema de Gestão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>{children}</body>
    </html>
  );
}