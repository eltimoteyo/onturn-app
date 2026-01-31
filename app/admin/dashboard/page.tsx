'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { getUserBusinesses, getBusinessAppointments, updateAppointmentStatus } from '@/lib/services/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Power, Menu, X, LogOut, ClipboardList, User, Users, Settings, CheckCircle, ArrowLeft, Stethoscope, FileText, Paperclip, Building2, Star } from 'lucide-react'
import Link from 'next/link'
import type { Business } from '@/types/business'
import type { AppointmentWithRelations, AppointmentStatus } from '@/types/appointment'

// Badge Component inline
const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: string }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-[#003366] border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    red: "bg-red-50 text-red-700 border-red-200"
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-bold border ${colors[color] || colors.blue} whitespace-nowrap`}>{children}</span>;
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, isBusinessOwner, isSpecialist, loading, user } = useAuth()
  const supabase = createClient()
  const [loadingData, setLoadingData] = useState(true)

  const [business, setBusiness] = useState<Business | null>(null)
  const [bookings, setBookings] = useState<AppointmentWithRelations[]>([])

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<AppointmentWithRelations | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultText, setResultText] = useState('')

  useEffect(() => {
    // Debug logging
    console.log('[DASHBOARD CHECK] Auth State:', { loading, isAuthenticated, user_id: user?.id, isBusinessOwner, isSpecialist, user_role: (user as any)?.role })

    if (loading) return

    if (!isAuthenticated) {
      console.log('[DASHBOARD] Usuario no autenticado, redirigiendo a login')
      router.push('/admin/login')
      return
    }

    if (isAuthenticated && user) {
      if (isBusinessOwner || isSpecialist) {
        console.log('[DASHBOARD] Usuario autorizado, cargando dashboard...')
        loadDashboardData()
      } else {
        console.log('[DASHBOARD] Rol no autorizado. Redirigiendo a /reservas')
        router.push('/reservas')
      }
    }
  }, [isAuthenticated, isBusinessOwner, isSpecialist, loading, user, router])

  const loadDashboardData = async () => {
    try {
      setLoadingData(true)
      if (!user?.id) return

      const businesses = await getUserBusinesses(user.id)

      let currentBusinessId = ''

      if (businesses.length > 0) {
        setBusiness(businesses[0])
        currentBusinessId = businesses[0].id
      } else {
        if (isBusinessOwner) {
          alert('No tienes un negocio registrado.')
          setLoadingData(false)
          return
        }
      }

      if (currentBusinessId) {
        const appointments = await getBusinessAppointments(currentBusinessId)
        setBookings(appointments)
      }

    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
    try {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
      await updateAppointmentStatus(id, newStatus)
    } catch (error) {
      console.error('Error actualizando estado:', error)
      alert('Error al actualizar el estado')
      loadDashboardData()
    }
  }

  const handleFinishBooking = (booking: AppointmentWithRelations) => {
    setSelectedBooking(booking)
    setShowResultModal(true)
  }

  const saveResults = async () => {
    if (!selectedBooking) return
    try {
      await supabase.from('appointments').update({
        status: 'completed',
        result_notes: resultText
      }).eq('id', selectedBooking.id)

      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'completed' as AppointmentStatus } : b))
      setShowResultModal(false)
      setResultText('')
      setSelectedBooking(null)
    } catch (error) {
      console.error('Error finalizando consulta:', error)
      alert('Error al guardar resultados')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge color="orange">Pendiente</Badge>;
      case 'confirmed': return <Badge color="blue">Confirmado</Badge>;
      case 'in_hall': return <Badge color="yellow">En Hall</Badge>;
      case 'in_progress': return <Badge color="purple">Atendiendo</Badge>;
      case 'completed': return <Badge color="green">Finalizado</Badge>;
      case 'cancelled': return <Badge color="red">Cancelado</Badge>;
      default: return <Badge color="slate">{status}</Badge>;
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto"></div>
          <p className="text-slate-600 font-medium text-lg">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#003366] capitalize">
              Gestión de Reservas
            </h2>
          </div>
        </header>

        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-4 max-w-5xl">
            {bookings.length === 0 ? (
              <Card className="border-dashed border-slate-300 shadow-none bg-slate-50">
                <CardContent className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <ClipboardList size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay reservas activas</p>
                  <p className="text-sm">Las nuevas solicitudes aparecerán aquí</p>
                </CardContent>
              </Card>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex gap-4 items-start w-full">
                      <div className="bg-slate-100 p-3 rounded-xl font-bold text-slate-600 text-center min-w-[5rem] flex flex-col justify-center border border-slate-200">
                        <span className="text-lg leading-none text-[#003366]">{booking.appointment_time?.slice(0, 5)}</span>
                        <span className="text-[10px] uppercase mt-1 font-bold text-slate-400">{booking.appointment_date}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#003366] text-lg leading-tight">{booking.customer_name}</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{booking.specialty_name || 'Servicio General'}</p>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {booking.specialist_name && (
                            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
                              <User size={12} /> {booking.specialist_name}
                            </span>
                          )}
                          {booking.customer_phone && (
                            <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                              📞 {booking.customer_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right self-start">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end border-t border-slate-50 pt-3">
                    {booking.status === 'pending' && (
                      <><Button size="sm" variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none h-8 text-xs" onClick={() => updateStatus(booking.id, 'cancelled')}>Rechazar</Button>
                        <Button size="sm" className="bg-[#003366] hover:bg-[#002244] h-8 text-xs" onClick={() => updateStatus(booking.id, 'confirmed')}>Aprobar</Button></>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button size="sm" className="bg-[#00A896] hover:bg-[#008f7f] text-white h-8 text-xs" onClick={() => updateStatus(booking.id, 'in_hall')}><CheckCircle size={14} className="mr-1" /> Llegó al Hall</Button>
                    )}
                    {booking.status === 'in_hall' && (
                      <Button size="sm" className="bg-[#003366] hover:bg-[#002244] h-8 text-xs" onClick={() => updateStatus(booking.id, 'in_progress')}><ArrowLeft size={14} className="mr-1" /> Pasar a Consulta</Button>
                    )}
                    {booking.status === 'in_progress' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green700 text-white h-8 text-xs" onClick={() => handleFinishBooking(booking)}><Stethoscope size={14} className="mr-1" /> Finalizar Atención</Button>
                    )}
                    {booking.status === 'completed' && (
                      <Button size="sm" variant="ghost" className="text-slate-400 h-8 text-xs" disabled><FileText size={14} className="mr-1" /> Ver Historia</Button>
                    )}
                  </div>
                </div>
              )))}
          </div>
        </div>
      </main>

      {showResultModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200 border border-slate-200 overflow-hidden">
            <div className="bg-[#003366] p-6 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><Stethoscope size={24} /> Consulta Médica</h3>
              <button onClick={() => setShowResultModal(false)}><X className="text-blue-200 hover:text-white" /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Paciente</p>
                <p className="text-2xl font-bold text-[#003366]">{selectedBooking?.customer_name}</p>
                <p className="text-sm text-slate-600 mt-1">Servicio: {selectedBooking?.specialty_name || 'General'}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones / Diagnóstico</label>
                  <textarea
                    className="w-full border border-slate-200 bg-white rounded-xl p-4 h-32 focus:ring-2 focus:ring-[#00A896] outline-none resize-none shadow-sm"
                    placeholder="Escribe aquí los detalles de la atención..."
                    value={resultText}
                    onChange={(e) => setResultText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Adjuntar Resultados (PDF/IMG)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-[#003366] transition-colors">
                    <Paperclip size={24} className="mb-2" />
                    <span className="text-sm">Click para subir archivos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <Button variant="ghost" onClick={() => setShowResultModal(false)}>Cancelar</Button>
              <Button className="bg-[#003366] hover:bg-[#002244]" onClick={saveResults}>Finalizar Atención</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

