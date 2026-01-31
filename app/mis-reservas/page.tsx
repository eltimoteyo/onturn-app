'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getUserAppointments } from '@/lib/services/appointments'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Search, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { AppointmentWithRelations } from '@/types/appointment'
import { PublicHeader } from '@/components/public/PublicHeader'

export default function MisReservasPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/mis-reservas')
      return
    }

    if (user?.id) {
      loadAppointments()
    }
  }, [user, isAuthenticated, authLoading])

  const loadAppointments = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const data = await getUserAppointments(user.id)
      setAppointments(data)
    } catch (error) {
      console.error('Error al cargar reservas:', error)
    } finally {
      setLoading(false)
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

  // Separar próximos e historial
  const now = new Date()
  const upcoming = appointments.filter(apt => {
    const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
    return aptDate >= now && ['pending', 'confirmed'].includes(apt.status)
  })

  const history = appointments.filter(apt => {
    const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
    return aptDate < now || ['completed', 'cancelled'].includes(apt.status)
  })

  // Filtrar por búsqueda y estado
  const filterAppointments = (list: AppointmentWithRelations[]) => {
    return list.filter(apt => {
      const matchesSearch = !searchQuery ||
        apt.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.specialist_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }

  const filteredUpcoming = filterAppointments(upcoming)
  const filteredHistory = filterAppointments(history)

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
      <PublicHeader backLink="/" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
          <div className="p-6 md:p-8">
            <div className="mb-8 border-b border-slate-100 pb-6">
              <h1 className="text-3xl font-bold text-[#003366] mb-2">Mis Reservas</h1>
              <p className="text-slate-500">Gestiona tus turnos y revisa tu historial</p>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por establecimiento o especialista..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-slate-200"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-[200px] h-12 rounded-xl bg-white border-slate-200"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-100 p-1 rounded-xl h-auto w-full sm:w-auto inline-flex mb-6">
                <TabsTrigger value="upcoming" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-white data-[state=active]:text-[#00A896] data-[state=active]:shadow-sm">
                  Próximos ({upcoming.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg px-6 py-2.5 font-medium data-[state=active]:bg-white data-[state=active]:text-[#003366] data-[state=active]:shadow-sm">
                  Historial ({history.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                {filteredUpcoming.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                      <Calendar className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-[#003366] mb-2">
                      No tienes turnos próximos
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                      Explora los establecimientos disponibles y reserva tu próximo turno fácilmente.
                    </p>
                    <Link href="/reservas">
                      <Button size="lg" className="bg-[#00A896] hover:bg-[#008f80] h-12 px-8 text-base">Buscar Establecimientos</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 mt-4">
                    {filteredUpcoming.map((appointment) => {
                      const appointmentDateTime = new Date(
                        `${appointment.appointment_date}T${appointment.appointment_time}`
                      )
                      return (
                        <Link
                          key={appointment.id}
                          href={`/mis-reservas/${appointment.id}`}
                        >
                          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-slate-200 hover:border-[#00A896]/50 group">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-bold text-[#003366] mb-1 group-hover:text-[#00A896] transition-colors">
                                    {appointment.business_name}
                                  </h3>
                                  {getStatusBadge(appointment.status)}
                                </div>
                              </div>
                              <div className="space-y-3 text-sm text-slate-600">
                                <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg">
                                  <Calendar className="h-4 w-4 text-[#00A896]" />
                                  <span className="font-medium">
                                    {format(appointmentDateTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg">
                                  <Clock className="h-4 w-4 text-[#00A896]" />
                                  <span className="font-medium">{format(appointmentDateTime, 'HH:mm')} hs</span>
                                </div>
                                {appointment.specialist_name && (
                                  <div className="flex items-center space-x-3 px-2">
                                    <AlertCircle className="h-4 w-4 text-slate-400" />
                                    <span>Especialista: <span className="font-semibold text-slate-700">{appointment.specialist_name}</span></span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                {filteredHistory.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                      <Clock className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-[#003366] mb-2">
                      No hay historial de reservas
                    </h3>
                    <p className="text-slate-500">
                      Tus reservas completadas o canceladas aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 mt-4">
                    {filteredHistory.map((appointment) => {
                      const appointmentDateTime = new Date(
                        `${appointment.appointment_date}T${appointment.appointment_time}`
                      )
                      return (
                        <Link
                          key={appointment.id}
                          href={`/mis-reservas/${appointment.id}`}
                        >
                          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-200 hover:bg-slate-50/50">
                            <CardContent className="p-6 opacity-80 hover:opacity-100 transition-opacity">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-bold text-slate-700 mb-1">
                                    {appointment.business_name}
                                  </h3>
                                  {getStatusBadge(appointment.status)}
                                </div>
                              </div>
                              <div className="space-y-2 text-sm text-slate-500">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(appointmentDateTime, "d 'de' MMMM, yyyy", { locale: es })}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
