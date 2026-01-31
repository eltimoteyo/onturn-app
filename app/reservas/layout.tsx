import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Reservar Turnos, Citas y Servicios Online | OnTurn',
    description: 'Encuentra peluquerías, dentistas, canchas deportivas y más cerca de ti. Compara horarios, lee reseñas y reserva tu turno al instante con OnTurn.',
    keywords: ['reservas online', 'turnos', 'citas médicas', 'peluquería', 'barbería', 'canchas', 'padel', 'dentista', 'agenda online'],
    openGraph: {
        title: 'Encuentra y Reserva tu próximo turno | OnTurn',
        description: 'La forma más fácil de agendar citas en tus negocios favoritos.',
        type: 'website',
    }
}

export default function ReservasLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}
