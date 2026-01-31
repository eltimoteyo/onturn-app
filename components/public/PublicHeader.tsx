'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronLeft, Power, LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/shared/Logo'

interface PublicHeaderProps {
    children?: React.ReactNode
    bgImage?: string
    backLink?: string
    className?: string
    centerContent?: React.ReactNode
}

export function PublicHeader({ children, bgImage, backLink = '/reservas', className = '', centerContent }: PublicHeaderProps) {
    const { user, isAuthenticated, logout } = useAuth()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Construct safe redirect URL for both server and client
    const currentPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    const loginHref = `/login?redirect=${encodeURIComponent(currentPath || '/')}`

    return (
        <div className={`relative ${className}`}>
            {/* Background Layer with Shape & Clipping */}
            <div className="absolute inset-0 z-0 rounded-b-[2rem] md:rounded-b-[3rem] shadow-xl overflow-hidden">
                {bgImage ? (
                    <>
                        {/* Imagen de fondo */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${bgImage})` }}
                        />
                        {/* Overlay Gradiente para legibilidad */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#003366]/90" />
                    </>
                ) : (
                    /* Fondo Azul Default */
                    <div className="w-full h-full bg-[#003366] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white rounded-full blur-3xl"></div>
                            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#00A896] rounded-full blur-3xl"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-8 sm:pb-10 lg:pb-12 flex flex-col h-full min-h-[inherit]">
                {/* Navbar (Top Row) REMOVED - Using Global Header */}

                {/* 2. Centro: Contenido Central (Buscador/Titulo) Only render if it's NOT the search bar which is now in Global Header, OR if it's meant to be hero content */}
                {/* Actually, looking at ReservasPage, centerContent WAS the Search Bar. If we remove it here, it's gone from the page flow? 
                    Wait, Global Header logic only shows Search if 'showSearch' is true. 
                    I enabled showSearch for /reservas in Global Header. 
                    So we can safely remove this Nav block. 
                */}

                {/* Main Content Area (Children - Categories, etc) */}
                <div className="w-full flex-grow flex flex-col bg-transparent">
                    {children}
                </div>
            </div>
        </div>
    )
}
