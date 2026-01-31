import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { ClientLoader } from "@/components/shared/ClientLoader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnTurn - Reserva tu Turno Online",
  description: "Sistema de gestión de reservas y turnos online para múltiples rubros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLoader>
          <Header />
          <main className="min-h-screen bg-slate-50">
            {children}
          </main>
          <Footer />
        </ClientLoader>
      </body>
    </html>
  );
}
