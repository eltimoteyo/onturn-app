'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getAllBusinesses, getAllCategories, searchBusinesses } from '@/lib/services/businesses'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Clock, LayoutGrid, Star, Shield, Scissors, Dumbbell, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import type { Business, Category } from '@/types/business'
import { PublicHeader } from '@/components/public/PublicHeader'
import { Skeleton } from '@/components/ui/skeleton'

// export const dynamic = 'force-dynamic' // Removed in favor of Suspense

function ReservasPageContent() {
  const searchParams = useSearchParams()
  const { user, logout, isAuthenticated } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('categoria') || null
  )

  useEffect(() => {
    loadData()
  }, [])

  // Listen to URL Params for Search
  useEffect(() => {
    const q = searchParams.get('q')
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q)
    }
  }, [searchParams])

  useEffect(() => {
    handleSearch()
  }, [searchQuery, selectedCategory]) // Trigger search when query or category changes

  const loadData = async () => {
    try {
      setLoading(true)
      const [businessesData, categoriesData] = await Promise.all([
        getAllBusinesses(),
        getAllCategories(),
      ])
      // Initial Filter if params exist
      const initialQ = searchParams.get('q')
      if (initialQ) {
        const filtered = await searchBusinesses(initialQ)
        setBusinesses(filtered || [])
      } else {
        setBusinesses(businessesData || [])
      }
      setCategories(categoriesData || [])
    } catch (error: any) {
      console.error('Error al cargar datos:', error)
      const errorMessage = error?.message || 'Error desconocido al cargar datos'
      setBusinesses([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      const data = await getAllBusinesses()
      setBusinesses(data || [])
    } catch (error: any) {
      console.error('Error al cargar establecimientos:', error)
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBusinesses()
      return
    }

    try {
      setLoading(true)
      const data = await searchBusinesses(searchQuery)
      setBusinesses(data || [])
    } catch (error: any) {
      console.error('Error en búsqueda:', error)
      setBusinesses([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryFilter = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug)
    if (categorySlug) {
      const filtered = businesses.filter(b => b.category?.slug === categorySlug)
      setBusinesses(filtered)
    } else {
      loadBusinesses()
    }
  }

  const filteredBusinesses = selectedCategory
    ? businesses.filter(b => b.category?.slug === selectedCategory)
    : businesses

  // Función para obtener el icono de categoría
  const getCategoryIcon = (categorySlug: string) => {
    const iconMap: Record<string, any> = {
      'salud': Shield,
      'belleza': Scissors,
      'deporte': Dumbbell,
      'legal': Briefcase,
    }
    return iconMap[categorySlug] || LayoutGrid
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Responsivo Mejorado - No centerContent passed anymore */}
      <PublicHeader backLink="/">
        <div className="max-w-7xl mx-auto w-full space-y-6">

          {/* Categorías (Carousel) */}
          <div className="w-full overflow-hidden">
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1 snap-x justify-start md:justify-center">
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  loadBusinesses()
                }}
                className={`snap-start flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border
                    ${selectedCategory === null
                    ? 'bg-[#00A896] text-white border-[#00A896] shadow-md'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm'}`}
              >
                <LayoutGrid size={16} /> Todas
              </button>
              {categories.map((category) => {
                const CategoryIcon = getCategoryIcon(category.slug)
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.slug)}
                    className={`snap-start flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all border
                        ${selectedCategory === category.slug
                        ? 'bg-[#00A896] text-white border-[#00A896] shadow-md'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm'}`}
                  >
                    <CategoryIcon size={16} /> {category.name}
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </PublicHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-8 relative z-20">

        {/* Section Title */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Explora nuestros aliados</h2>
          <p className="text-slate-500 mt-2">Encuentra los mejores lugares para reservar tu próximo turno.</p>
        </div>

        {/* Lista de Establecimientos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col h-full border rounded-xl overflow-hidden bg-white shadow-sm">
                <Skeleton className="h-48 w-full bg-slate-200" />
                <div className="p-5 space-y-3 flex-1">
                  <Skeleton className="h-6 w-3/4 bg-slate-200" />
                  <Skeleton className="h-4 w-1/2 bg-slate-100" />
                  <div className="mt-auto pt-4 flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">
                No se encontraron establecimientos
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
                loadBusinesses()
              }}>
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredBusinesses.map((business) => (
              <Link key={business.id} href={`/${business.slug}`}>
                <Card className="p-0 overflow-hidden flex flex-col h-full group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg cursor-pointer">
                  <div className="h-48 bg-slate-200 relative overflow-hidden">
                    {business.logo || (business.images && business.images[0]) ? (
                      <img
                        src={business.logo || business.images?.[0]}
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#003366] to-[#00A896] flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">{business.name[0]}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                    {business.rating && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm text-slate-800">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" /> {business.rating}
                        {business.total_reviews && <span className="opacity-70 text-[10px]">({business.total_reviews})</span>}
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="font-bold text-[#003366] text-xl leading-tight group-hover:text-[#00A896] transition-colors">{business.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <MapPin size={14} /> {business.address || `${business.city}${business.state ? `, ${business.state}` : ''}`}
                      </p>
                    </div>

                    {business.category && (
                      <div className="flex flex-wrap gap-2 mt-auto mb-5">
                        <Badge variant="slate">{business.category.name}</Badge>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[#00A896] font-bold">
                        <Clock size={16} />
                        <span className="bg-teal-50 px-3 py-1 rounded-lg">Disponible</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {/* Sección SEO & AI-Friendly Content */}
        <section className="mt-16 md:mt-24 max-w-5xl mx-auto text-center md:text-left space-y-12">

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#003366]">Reserva Citas, Turnos y Servicios en OnTurn</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              OnTurn es la plataforma líder para agendar <strong>citas médicas</strong>, reservar horas en <strong>salones de belleza</strong> y gestionar turnos en todo tipo de negocios. Conectamos a usuarios con profesionales de confianza para que asegures tu atención sin esperas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <article>
              <h3 className="text-xl font-bold text-[#003366] mb-3">Salud y Bienestar</h3>
              <p className="text-slate-600">
                Encuentra doctores y especialistas cerca de ti. Desde <strong>agendar una cita con un dentista</strong> hasta consultas de medicina general. Visualiza horarios en tiempo real y gestiona tu salud sin llamadas.
              </p>
            </article>

            <article>
              <h3 className="text-xl font-bold text-[#003366] mb-3">Belleza y Estética</h3>
              <p className="text-slate-600">
                Reserva tu momento de relax. Encuentra los mejores <strong>salones de belleza</strong> para servicios de <strong>laseado, manicure y uñas</strong>, o agendar un corte en las <strong>barberías</strong> más destacadas de tu ciudad.
              </p>
            </article>

            <article>
              <h3 className="text-xl font-bold text-[#003366] mb-3">Servicios Profesionales</h3>
              <p className="text-slate-600">
                Optimiza tu tiempo agendando citas con <strong>abogados</strong>, contadores y consultores. Evita las colas y asegura tu reunión profesional con un clic.
              </p>
            </article>

            <article>
              <h3 className="text-xl font-bold text-[#003366] mb-3">Deportes y Recreación</h3>
              <p className="text-slate-600">
                Organiza tu partido perfecto. Reserva <strong>canchas de fútbol, padel y tenis</strong> al instante. Compara disponibilidad y precios para jugar cuando quieras.
              </p>
            </article>
          </div>

        </section>
      </div>
    </div>
  )
}

export default function ReservasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-600">Cargando...</p></div>}>
      <ReservasPageContent />
    </Suspense>
  )
}
