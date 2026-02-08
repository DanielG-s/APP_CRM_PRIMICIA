import { SidebarProvider } from "./contexts/SidebarContext"; // Ajuste o caminho
import LayoutShell from "./components/LayoutShell"; // Ajuste o caminho
import "./globals.css";

export const metadata = {
  title: "Merxios CRM",
  description: "Dashboard de Performance",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SidebarProvider>
            <LayoutShell>
                {children}
            </LayoutShell>
        </SidebarProvider>
      </body>
    </html>
  );
}