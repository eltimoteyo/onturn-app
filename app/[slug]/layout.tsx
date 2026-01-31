import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

type Props = {
    params: Promise<{ slug: string }>
    children: React.ReactNode
}

async function getBusiness(slug: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('businesses')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .single()

    return data
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const resolvedParams = await params
    const business = await getBusiness(resolvedParams.slug)

    if (!business) {
        return {
            title: 'Negocio no encontrado | OnTurn',
            description: 'El establecimiento que buscas no está disponible en OnTurn.'
        }
    }

    const title = `${business.name} - Reserva tu turno | OnTurn`
    const description = business.description || `Reserva cita en ${business.name}. ${business.address || ''}. Horarios disponibles y atención inmediata.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: business.images?.[0] ? [business.images[0]] : business.logo ? [business.logo] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: business.images?.[0] ? [business.images[0]] : [],
        }
    }
}

export default async function BusinessLayout({
    children,
    params,
}: Props) {
    const resolvedParams = await params
    const business = await getBusiness(resolvedParams.slug)

    // JSON-LD Schema para Google (LocalBusiness)
    const jsonLd = business ? {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: business.name,
        image: business.images?.[0] || business.logo,
        '@id': `https://onturn.app/${business.slug}`,
        url: `https://onturn.app/${business.slug}`,
        telephone: business.phone,
        address: {
            '@type': 'PostalAddress',
            streetAddress: business.address,
            addressLocality: business.city,
            addressRegion: business.state,
            addressCountry: 'PE' // Asumiendo Perú por el contexto
        },
        geo: (business.latitude && business.longitude) ? {
            '@type': 'GeoCoordinates',
            latitude: business.latitude,
            longitude: business.longitude
        } : undefined,
        aggregateRating: business.rating ? {
            '@type': 'AggregateRating',
            ratingValue: business.rating,
            reviewCount: business.total_reviews || 1
        } : undefined,
        priceRange: '$$'
    } : null

    return (
        <>
            {business && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </>
    )
}
