import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Página no encontrada</h2>
          <p className="text-gray-600 mb-6">
            La página que buscas no existe o ha sido movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Ir al Inicio
              </Button>
            </Link>
            <Link href="/reservas">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ver Establecimientos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
