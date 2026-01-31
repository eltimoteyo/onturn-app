'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getAppointmentById } from '@/lib/services/appointments'
import { updateAppointmentStatus } from '@/lib/services/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  CheckCircle,
  XCircle,
  Save,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import es from 'date-fns/locale/es'
import type { AppointmentWithRelations } from '@/types/appointment'

export default function AdminAppointmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id as string
  const { user, isAuthenticated, isBusinessOwner, loading: authLoading } = useAuth()
  const [appointment, setAppointment] = useState<AppointmentWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resultData, setResultData] = useState({
    result: '',
    result_notes: '',
    prescription: '',
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/admin/reservas/${appointmentId}`)
      return
    }

    if (!authLoading && !isBusinessOwner) {
      router.push('/reservas')
      return
    }

    if (appointmentId) {
      loadAppointment()
    }
  }, [appointmentId, isAuthenticated, isBusinessOwner, authLoading])

  const loadAppointment = async () => {
    try {
      setLoading(true)
      const data = await getAppointmentById(appointmentId)
      setAppointment(data)
      setResultData({
        result: data.result || '',
        result_notes: data.result_notes || '',
        prescription: data.prescription || '',
      })
    } catch (error: any) {
      console.error('Error al cargar reserva:', error)
      alert('Error al cargar la reserva')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: 'confirmed' | 'cancelled' | 'completed') => {
    if (!appointment) return

    try {
      await updateAppointmentStatus(appointment.id, status)
      loadAppointment()
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert('Error al actualizar el estado')
    }
  }

  const handleSaveResult = async () => {
    if (!appointment) return

    try {
      setSaving(true)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { error } = await supabase
        .from('appointments')
        .update({
          result: resultData.result || null,
          result_notes: resultData.result_notes || null,
          prescription: resultData.prescription || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointment.id)

      if (error) throw error

      // Cambiar estado a completado si hay resultado
      if (resultData.result && appointment.status !== 'completed') {
        await updateAppointmentStatus(appointment.id, 'completed')
      }

      loadAppointment()
      alert('Resultado guardado exitosamente')
    } catch (error: any) {
      console.error('Error al guardar resultado:', error)
      alert('Error al guardar el resultado')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Reserva no encontrada</h2>
            <Link href="/admin/reservas">
              <Button>Volver a Reservas</Button>
            </Link>
          </CardContent>
        </Card>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/reservas">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Detalle de Reserva</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Información del Cliente */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <p className="text-gray-900">{appointment.customer_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${appointment.customer_email}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {appointment.customer_email}
                </a>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${appointment.customer_phone}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {appointment.customer_phone}
                </a>
              </div>
            </div>
            {appointment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700">Notas del Cliente</label>
                <p className="text-gray-900 mt-1">{appointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de la Reserva */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Información de la Reserva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha</label>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">
                  {format(appointmentDateTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hora</label>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">{format(appointmentDateTime, 'HH:mm')}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <div className="mt-1">{getStatusBadge(appointment.status)}</div>
            </div>
            {appointment.specialist_name && (
              <div>
                <label className="text-sm font-medium text-gray-700">Especialista</label>
                <p className="text-gray-900">{appointment.specialist_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {appointment.status === 'pending' && (
              <>
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange('confirmed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar Reserva
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleStatusChange('cancelled')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar Reserva
                </Button>
              </>
            )}
            {appointment.status === 'confirmed' && (
              <Button
                className="w-full"
                onClick={() => handleStatusChange('completed')}
              >
                Marcar como Completado
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Registrar Resultado */}
        {appointment.status === 'confirmed' || appointment.status === 'completed' ? (
          <Card className="lg:col-span-3 border-0 shadow-md">
            <CardHeader>
              <CardTitle>Registrar Resultado de la Consulta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="result" className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado/Diagnóstico
                </label>
                <textarea
                  id="result"
                  rows={4}
                  value={resultData.result}
                  onChange={(e) => setResultData({ ...resultData, result: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  placeholder="Ingresa el resultado o diagnóstico de la consulta..."
                />
              </div>

              <div>
                <label htmlFor="result_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  id="result_notes"
                  rows={4}
                  value={resultData.result_notes}
                  onChange={(e) => setResultData({ ...resultData, result_notes: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  placeholder="Observaciones adicionales del especialista..."
                />
              </div>

              <div>
                <label htmlFor="prescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Receta/Prescripción
                </label>
                <textarea
                  id="prescription"
                  rows={4}
                  value={resultData.prescription}
                  onChange={(e) => setResultData({ ...resultData, prescription: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  placeholder="Ingresa la receta o prescripción médica..."
                />
              </div>

              <Button onClick={handleSaveResult} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Resultado'}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Resultado Existente */}
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
                    <span>Observaciones</span>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
