'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getAppointmentById } from '@/lib/services/appointments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  FileCheck,
  Stethoscope,
  ArrowLeft,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AppointmentWithRelations } from '@/types/appointment'
import { PublicHeader } from '@/components/public/PublicHeader'

export default function AppointmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [appointment, setAppointment] = useState<AppointmentWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/mis-reservas/${appointmentId}`)
      return
    }

    if (user?.id && appointmentId) {
      loadAppointment()
    }
  }, [user, isAuthenticated, authLoading, appointmentId])

  const loadAppointment = async () => {
    try {
      setLoading(true)
      const data = await getAppointmentById(appointmentId)

      // Verificar que la reserva pertenece al usuario
      if (data.user_id !== user?.id) {
        setError('No tienes permiso para ver esta reserva')
        return
      }

      setAppointment(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar la reserva')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Cargando detalles...</p>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicHeader backLink="/mis-reservas" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
          <Card className="border-0 shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reserva no encontrada</h2>
            <p className="text-gray-600 mb-6">{error || 'La reserva que buscas no existe'}</p>
            <Link href="/mis-reservas">
              <Button>Volver a Mis Reservas</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  const appointmentDateTime = new Date(
    `${appointment.appointment_date}T${appointment.appointment_time}`
  )

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pendiente', variant: 'warning' as const },
      confirmed: { label: 'Confirmado', variant: 'success' as const },
      completed: { label: 'Completado', variant: 'default' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    }
    const statusConfig = config[status as keyof typeof config] || config.pending
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PublicHeader backLink="/mis-reservas" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        {/* Header Content inside Page */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100">
            <div>
              <h1 className="text-3xl font-bold text-[#003366] mb-2">Detalle de Reserva</h1>
              <p className="text-slate-500">Reserva #{appointment.id.slice(0, 8)}</p>
            </div>
            <div className="hidden sm:block">
              {getStatusBadge(appointment.status)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Información de la Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fecha</label>
                    <p className="text-gray-900">
                      {format(appointmentDateTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Hora</label>
                  <p className="text-gray-900">{format(appointmentDateTime, 'HH:mm')}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Estado</label>
                <div className="mt-1">{getStatusBadge(appointment.status)}</div>
              </div>

              {appointment.notes && (
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notas/Motivo</label>
                    <p className="text-gray-900 mt-1">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Establecimiento */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Establecimiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointment.business_slug ? (
                <Link href={`/${appointment.business_slug}`}>
                  <h3 className="text-lg font-semibold text-primary-600 hover:text-primary-700">
                    {appointment.business_name}
                  </h3>
                </Link>
              ) : (
                <h3 className="text-lg font-semibold text-gray-900">
                  {appointment.business_name}
                </h3>
              )}

              {appointment.business_address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{appointment.business_address}</p>
                    {appointment.business_city && (
                      <p className="text-sm text-gray-600">{appointment.business_city}</p>
                    )}
                  </div>
                </div>
              )}

              {appointment.business_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <a
                    href={`tel:${appointment.business_phone}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {appointment.business_phone}
                  </a>
                </div>
              )}

              {appointment.business_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a
                    href={`mailto:${appointment.business_email}`}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {appointment.business_email}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Especialista */}
          {appointment.specialist_name && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Especialista</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-gray-900">{appointment.specialist_name}</p>
                  </div>
                </div>
                {appointment.specialty_name && (
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Especialidad</label>
                      <p className="text-gray-900">{appointment.specialty_name}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resultado de la Reserva (si está completada) */}
          {appointment.status === 'completed' && (
            <Card className="lg:col-span-3 border-0 shadow-md">
              <CardHeader>
                <CardTitle>Resultado de la Consulta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {appointment.result && (
                  <div>
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-2">
                      <Stethoscope className="h-5 w-5" />
                      <span>Resultado/Diagnóstico</span>
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{appointment.result}</p>
                  </div>
                )}

                {appointment.result_notes && (
                  <div>
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-2">
                      <FileText className="h-5 w-5" />
                      <span>Observaciones del Especialista</span>
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{appointment.result_notes}</p>
                  </div>
                )}

                {appointment.prescription && (
                  <div>
                    <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-2">
                      <FileCheck className="h-5 w-5" />
                      <span>Receta</span>
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{appointment.prescription}</p>
                    </div>
                  </div>
                )}

                {appointment.attachments && appointment.attachments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Archivos Adjuntos</h3>
                    <div className="space-y-2">
                      {appointment.attachments.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                        >
                          <Download className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <Card className="lg:col-span-3 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {appointment.business_slug && (
                  <Link href={`/${appointment.business_slug}`}>
                    <Button variant="outline">Ver Establecimiento</Button>
                  </Link>
                )}
                {appointment.status === 'pending' && (
                  <Button variant="destructive">Cancelar Reserva</Button>
                )}
                {appointment.status === 'confirmed' && (
                  <>
                    <Button variant="outline">Cambiar Fecha/Hora</Button>
                    <Button variant="destructive">Cancelar Reserva</Button>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Comprobante
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
