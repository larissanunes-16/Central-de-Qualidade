import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { UsuarioAtualProvider } from "@/components/UsuarioAtualProvider";

export const metadata: Metadata = {
  title: "Central de Qualidade — SECTI",
  description: "Ciclo de qualidade de serviços públicos da Prefeitura do Recife",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <UsuarioAtualProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
          </div>
        </UsuarioAtualProvider>
      </body>
    </html>
  );
}
