'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserAppointments } from '@/lib/services/appointments'
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import es from 'date-fns/locale/es'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AppointmentWithRelations } from '@/types/appointment'

export function UpcomingAppointments() {
  const { user, isAuthenticated } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUpcomingAppointments()
    }
  }, [user, isAuthenticated])

  const loadUpcomingAppointments = async () => {
    if (!user?.id) return

    try {
      const allAppointments = await getUserAppointments(user.id)
      const now = new Date()
      
      const upcoming = allAppointments
        .filter(apt => {
          const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
          return aptDate >= now && ['pending', 'confirmed'].includes(apt.status)
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`)
          const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`)
          return dateA.getTime() - dateB.getTime()
        })
        .slice(0, 3) // Solo los próximos 3

      setAppointments(upcoming)
    } catch (error) {
      console.error('Error al cargar próximos turnos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || loading) {
    return null
  }

  if (appointments.length === 0) {
    return (
      <div className="hidden lg:block">
        <Card className="w-80 border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-2">No tienes turnos próximos</p>
            <Link href="/reservas" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Buscar Establecimientos
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="hidden lg:block">
      <Card className="w-80 border-0 shadow-md">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Próximos Turnos</h3>
          <div className="space-y-3">
            {appointments.map((appointment) => {
              const appointmentDateTime = new Date(
                `${appointment.appointment_date}T${appointment.appointment_time}`
              )
              return (
                <Link
                  key={appointment.id}
                  href={`/mis-reservas/${appointment.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {appointment.business_name}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(appointmentDateTime, "d 'de' MMM", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(appointmentDateTime, 'HH:mm')}</span>
                    </div>
                    {appointment.business_city && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{appointment.business_city}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={
                        appointment.status === 'confirmed' ? 'success' : 'warning'
                      }
                      className="text-xs"
                    >
                      {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                    </Badge>
                  </div>
                </Link>
              )
            })}
          </div>
          <Link
            href="/mis-reservas"
            className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-3 pt-3 border-t border-gray-200"
          >
            Ver todas mis reservas
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
