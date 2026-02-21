'use client'

import { usePathname } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { ClientLoader } from "@/components/shared/ClientLoader";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Ocultar header/footer en rutas de admin y super-admin (tienen su propio layout)
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/super-admin')
  
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ConfirmDialog />
        <ClientLoader>
          {isAdminRoute ? (
            // Admin routes: sin header/footer, sin wrapper (layout propio)
            children
          ) : (
            // Public routes: con header/footer
            <>
              <Header />
              <main className="min-h-screen bg-slate-50">
                {children}
              </main>
              <Footer />
            </>
          )}
        </ClientLoader>
      </ToastProvider>
    </ErrorBoundary>
  )
}
