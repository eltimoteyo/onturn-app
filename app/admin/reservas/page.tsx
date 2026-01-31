'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getAllBusinessAppointments, updateAppointmentStatus } from '@/lib/services/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Calendar, Clock, User, Phone, Mail, CheckCircle, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AppointmentWithRelations } from '@/types/appointment'

export default function AdminReservasPage() {
  const router = useRouter()
  const { user, isAuthenticated, isBusinessOwner, loading: authLoading } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/reservas')
      return
    }

    if (!authLoading && !isBusinessOwner) {
      router.push('/reservas')
      return
    }

    loadAppointments()
  }, [isAuthenticated, isBusinessOwner, authLoading, statusFilter])

  const loadAppointments = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const data = await getAllBusinessAppointments(user.id)
      setAppointments(data)
    } catch (error) {
      console.error('Error al cargar reservas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed')
      loadAppointments()
    } catch (error) {
      console.error('Error al aprobar reserva:', error)
      alert('Error al aprobar la reserva')
    }
  }

  const handleReject = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de rechazar esta reserva?')) return

    try {
      await updateAppointmentStatus(appointmentId, 'cancelled')
      loadAppointments()
    } catch (error) {
      console.error('Error al rechazar reserva:', error)
      alert('Error al rechazar la reserva')
    }
  }

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

  const filteredAppointments = statusFilter === 'all'
    ? appointments
    : appointments.filter(apt => apt.status === statusFilter)

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="md:hidden text-[#003366]">
              <ArrowLeft size={28} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-[#003366]">
              Control de Turnos
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">Admin Negocio</span>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
              {user?.email?.[0].toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* KPI Rápido */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-100 p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">En Espera</p>
            <p className="text-xl md:text-2xl font-bold text-[#003366]">
              {appointments.filter(b => b.status === 'pending').length}
            </p>
          </Card>
          <Card className="bg-yellow-50 border-yellow-100 p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Confirmados</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-700">
              {appointments.filter(b => b.status === 'confirmed').length}
            </p>
          </Card>
          <Card className="bg-purple-50 border-purple-100 p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Hoy</p>
            <p className="text-xl md:text-2xl font-bold text-purple-700">
              {appointments.filter(apt => {
                const today = new Date().toISOString().split('T')[0]
                return apt.appointment_date === today
              }).length}
            </p>
          </Card>
          <Card className="bg-green-50 border-green-100 p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Total</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">{appointments.length}</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </Select>
        </div>

        {/* Lista de Reservas */}
        {filteredAppointments.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay reservas
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'all'
                  ? 'Aún no tienes reservas registradas'
                  : `No hay reservas con estado "${statusFilter}"`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const appointmentDateTime = new Date(
                `${appointment.appointment_date}T${appointment.appointment_time}`
              )
              return (
                <div key={appointment.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  {/* Fila Superior: Info + Badge */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="bg-slate-100 p-2 rounded-lg font-bold text-slate-600 text-center min-w-[3.5rem] text-sm">
                        {format(appointmentDateTime, 'HH:mm')}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#003366] leading-tight">{appointment.customer_name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{appointment.business_name}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>

                  {/* Fila Inferior: Botones de Acción */}
                  <div className="flex flex-wrap gap-2 justify-end border-t border-slate-50 pt-3">
                    {appointment.status === 'pending' && (
                      <>
                        <Button size="sm" variant="secondary" className="flex-1 sm:flex-none" onClick={() => handleReject(appointment.id)}>
                          Rechazar
                        </Button>
                        <Button size="sm" variant="default" className="flex-1 sm:flex-none" onClick={() => handleApprove(appointment.id)}>
                          Aprobar
                        </Button>
                      </>
                    )}

                    {appointment.status === 'confirmed' && (
                      <Button size="sm" variant="accent" className="w-full sm:w-auto" onClick={() => {
                        // TODO: Implementar cambio a "in_hall"
                      }}>
                        <CheckCircle size={16} className="mr-1" /> Llegó al Hall
                      </Button>
                    )}

                    <Link href={`/admin/reservas/${appointment.id}`} className="w-full sm:w-auto">
                      <Button size="sm" variant="outline" className="w-full">
                        <Eye size={16} className="mr-1" /> Ver Detalle
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
