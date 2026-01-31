'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Power, Menu, X, LogOut, ClipboardList, Clock, FileText, Upload } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  business_id: string
  specialist_id: string | null
  customer_name: string
  customer_email: string
  customer_phone: string
  appointment_date: string
  appointment_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  result: string | null
  result_notes: string | null
  prescription: string | null
  attachments: any
  created_at: string
  specialist?: {
    name: string
    specialty?: {
      name: string
    }
  }
}

export default function EspecialistaReservasPage() {
  const router = useRouter()
  const { isAuthenticated, userType, loading, user } = useAuth()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [specialtyId, setSpecialtyId] = useState<string | null>(null)
  const [specialtyName, setSpecialtyName] = useState<string>('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed'>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [resultNotes, setResultNotes] = useState('')
  const [prescription, setPrescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || userType !== 'specialist')) {
      router.push('/reservas')
      return
    }

    if (!loading && isAuthenticated && userType === 'specialist' && user) {
      loadSpecialtyAndAppointments()
    }
  }, [isAuthenticated, userType, loading, user, filter])

  const loadSpecialtyAndAppointments = async () => {
    try {
      if (!user?.id) return

      // Obtener el tenant_user para saber la especialidad del especialista
      const { data: tenantUser, error: tenantUserError } = await supabase
        .from('tenant_users')
        .select('specialty_id, tenant_id')
        .eq('user_id', user.id)
        .eq('role', 'specialist')
        .single()

      if (tenantUserError || !tenantUser || !tenantUser.specialty_id) {
        alert('No tienes una especialidad asignada. Contacta al administrador.')
        return
      }

      setSpecialtyId(tenantUser.specialty_id)

      // Obtener nombre de la especialidad
      const { data: specialty, error: specialtyError } = await supabase
        .from('specialties')
        .select('name')
        .eq('id', tenantUser.specialty_id)
        .single()

      if (!specialtyError && specialty) {
        setSpecialtyName(specialty.name)
      }

      // Obtener especialistas de esta especialidad
      const { data: specialists, error: specialistsError } = await supabase
        .from('specialists')
        .select('id')
        .eq('specialty_id', tenantUser.specialty_id)
        .eq('is_active', true)

      if (specialistsError) throw specialistsError

      const specialistIds = specialists?.map(s => s.id) || []

      if (specialistIds.length === 0) {
        setAppointments([])
        return
      }

      // Obtener reservas de estos especialistas
      let query = supabase
        .from('appointments')
        .select(`
          *,
          specialist:specialists(
            name,
            specialty:specialties(name)
          )
        `)
        .in('specialist_id', specialistIds)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error al cargar reservas:', error)
      alert('Error al cargar las reservas')
    }
  }

  const handleStartAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'in_progress' })
        .eq('id', appointmentId)

      if (error) throw error
      loadSpecialtyAndAppointments()
    } catch (error: any) {
      console.error('Error al iniciar atención:', error)
      alert('Error al iniciar atención')
    }
  }

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'completed',
          result_notes: resultNotes || null,
          prescription: prescription || null,
        })
        .eq('id', selectedAppointment.id)

      if (error) throw error

      alert('Reserva completada exitosamente')
      setShowDetailsModal(false)
      setSelectedAppointment(null)
      setResultNotes('')
      setPrescription('')
      loadSpecialtyAndAppointments()
    } catch (error: any) {
      console.error('Error al completar reserva:', error)
      alert('Error al completar reserva')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDetails = (appointment: Appointment) => {
    if (appointment.status === 'in_progress' || appointment.status === 'completed') {
      setSelectedAppointment(appointment)
      setResultNotes(appointment.result_notes || '')
      setPrescription(appointment.prescription || '')
      setShowDetailsModal(true)
    } else {
      alert('Solo puedes ver detalles de reservas en atención o completadas')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row relative">
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-[#003366] text-white p-6 flex flex-col z-40 transition-transform duration-300 md:relative md:translate-x-0 shadow-2xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-white p-1 rounded"><Power className="text-[#003366]" size={20} /></div> 
            OnTurn
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-blue-200">
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <div className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors bg-[#00A896] text-white font-bold">
            <ClipboardList size={20} /> Mis Reservas
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-blue-900">
          <p className="text-sm text-blue-200 mb-2">Especialidad:</p>
          <p className="font-bold">{specialtyName || 'Cargando...'}</p>
        </div>

        <button onClick={() => router.push('/reservas')} className="mt-4 flex items-center gap-2 text-blue-200 hover:text-white pt-4 border-t border-blue-900">
          <LogOut size={18} /> Salir
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-[#003366]">
              <Menu size={28} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-[#003366]">
              Reservas - {specialtyName}
            </h2>
          </div>
        </header>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Todas
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            Pendientes
          </Button>
          <Button
            variant={filter === 'confirmed' ? 'default' : 'outline'}
            onClick={() => setFilter('confirmed')}
            size="sm"
          >
            Confirmadas
          </Button>
          <Button
            variant={filter === 'in_progress' ? 'default' : 'outline'}
            onClick={() => setFilter('in_progress')}
            size="sm"
          >
            En Atención
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilter('completed')}
            size="sm"
          >
            Completadas
          </Button>
        </div>

        {/* Lista de reservas */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">No hay reservas {filter !== 'all' ? filter : ''}</p>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-[#003366] text-lg">{appointment.customer_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          appointment.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                          appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {appointment.status === 'pending' ? 'Pendiente' :
                           appointment.status === 'confirmed' ? 'Confirmada' :
                           appointment.status === 'in_progress' ? 'En Atención' :
                           appointment.status === 'completed' ? 'Completada' :
                           'Cancelada'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        📅 {new Date(appointment.appointment_date).toLocaleDateString('es-ES')} 
                        {' '}🕐 {appointment.appointment_time}
                      </p>
                      <p className="text-sm text-slate-500">📧 {appointment.customer_email}</p>
                      <p className="text-sm text-slate-500">📞 {appointment.customer_phone}</p>
                      {appointment.specialist && (
                        <p className="text-sm text-slate-500 mt-1">
                          👤 {appointment.specialist.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartAppointment(appointment.id)}
                        >
                          Iniciar Atención
                        </Button>
                      )}
                      {(appointment.status === 'in_progress' || appointment.status === 'completed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(appointment)}
                        >
                          <FileText size={16} className="mr-2" />
                          Ver Detalles
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Modal de detalles */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detalles de la Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-700">Cliente</p>
                <p>{selectedAppointment.customer_name}</p>
                <p className="text-sm text-slate-600">{selectedAppointment.customer_email}</p>
                <p className="text-sm text-slate-600">{selectedAppointment.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Fecha y Hora</p>
                <p>{new Date(selectedAppointment.appointment_date).toLocaleDateString('es-ES')} {selectedAppointment.appointment_time}</p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm font-bold text-slate-700">Notas</p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
              {selectedAppointment.status === 'in_progress' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Notas del Resultado</label>
                    <textarea
                      value={resultNotes}
                      onChange={(e) => setResultNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366]"
                      placeholder="Ingresa las notas del resultado de la atención..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Receta/Prescription</label>
                    <textarea
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366]"
                      placeholder="Ingresa la receta o prescripción..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleCompleteAppointment} disabled={saving}>
                      {saving ? 'Guardando...' : 'Completar Atención'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowDetailsModal(false)
                      setSelectedAppointment(null)
                      setResultNotes('')
                      setPrescription('')
                    }}>
                      Cerrar
                    </Button>
                  </div>
                </>
              )}
              {selectedAppointment.status === 'completed' && (
                <>
                  {selectedAppointment.result_notes && (
                    <div>
                      <p className="text-sm font-bold text-slate-700">Notas del Resultado</p>
                      <p className="text-sm">{selectedAppointment.result_notes}</p>
                    </div>
                  )}
                  {selectedAppointment.prescription && (
                    <div>
                      <p className="text-sm font-bold text-slate-700">Receta/Prescription</p>
                      <p className="text-sm">{selectedAppointment.prescription}</p>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedAppointment(null)
                  }}>
                    Cerrar
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
