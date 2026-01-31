'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // No mostrar sidebar en login pagina
    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
                {children}
            </div>
        </div>
    )
}
