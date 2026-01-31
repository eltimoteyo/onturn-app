import { notFound } from 'next/navigation'
import { getCategoryBySlug, getBusinessesByCategory } from '@/lib/services/businesses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PublicHeader } from '@/components/public/PublicHeader'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const category = await getCategoryBySlug(resolvedParams.slug).catch(() => null)

  if (!category) {
    return {
      title: 'Categoría no encontrada | OnTurn',
    }
  }

  return {
    title: `Reservar ${category.name} Online - Mejores ${category.name} | OnTurn`,
    description: `Encuentra los mejores ${category.name} y reserva tu turno online. Compara horarios, precios y disponibilidad.`,
    openGraph: {
      title: `Reservar ${category.name} Online`,
      description: `Encuentra y reserva ${category.name} online.`,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params
  const category = await getCategoryBySlug(resolvedParams.slug).catch(() => null)

  if (!category) {
    notFound()
  }

  const businesses = await getBusinessesByCategory(resolvedParams.slug).catch(() => [])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PublicHeader backLink="/reservas" className="mb-8">
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-blue-100 max-w-2xl">{category.description}</p>
          )}
          <p className="text-sm font-medium text-teal-200 inline-block bg-teal-900/30 px-3 py-1 rounded-full border border-teal-500/30">
            {businesses.length} establecimiento{businesses.length !== 1 ? 's' : ''} disponible{businesses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </PublicHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {businesses.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">
                No hay establecimientos disponibles en esta categoría
              </p>
              <Link href="/reservas">
                <Button variant="outline">Ver todos los establecimientos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link key={business.id} href={`/${business.slug}`}>
                <Card className="hover:shadow-xl transition-all duration-200 cursor-pointer h-full border-0 shadow-lg flex flex-col overflow-hidden group">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#003366] to-[#00A896] flex items-center justify-center text-white text-4xl font-bold">
                        {business.name[0]}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1 text-[#003366] group-hover:text-[#00A896] transition-colors">{business.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        {business.city && (
                          <>
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{business.city}</span>
                          </>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    {business.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {business.description}
                      </p>
                    )}
                    <Button className="w-full bg-white text-[#00A896] border border-[#00A896] hover:bg-[#00A896] hover:text-white transition-colors" variant="outline">
                      Ver Detalles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {businesses.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200 space-y-8">
            <h2 className="text-2xl font-bold text-[#003366]">Preguntas frecuentes sobre {category.name}</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <article>
                <h3 className="font-bold text-lg text-slate-800 mb-2">¿Cómo agendar una cita de {category.name} online?</h3>
                <p className="text-slate-600">
                  Explora nuestra lista de profesionales y centros de {category.name} mejor calificados. Compara precios, lee opiniones de otros clientes y selecciona el horario que mejor se adapte a tu agenda. La confirmación es inmediata.
                </p>
              </article>
              <article>
                <h3 className="font-bold text-lg text-slate-800 mb-2">¿Cuánto cuesta un servicio de {category.name}?</h3>
                <p className="text-slate-600">
                  Los precios pueden variar según el establecimiento y el tipo de servicio específico. En OnTurn, puedes ver los detalles y, en muchos casos, los precios estimados antes de confirmar tu reserva.
                </p>
              </article>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
