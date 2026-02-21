'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useConfirm } from '@/hooks/useConfirm'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Power, Menu, X, LogOut, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface RegistrationRequest {
  id: string
  applicant_email: string
  applicant_name: string
  applicant_user_id: string | null
  business_name: string
  business_description: string
  business_category_id: string | null
  business_address: string
  business_city: string
  business_state: string
  business_phone: string
  business_email: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
  category?: {
    name: string
  }
}

export default function SolicitudesPage() {
  const router = useRouter()
  const { isAuthenticated, userType, loading, user, logout } = useAuth()
  const { confirm } = useConfirm()
  const { success, error: showError } = useToast()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [requests, setRequests] = useState<RegistrationRequest[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [loadingRequests, setLoadingRequests] = useState(true)

  useEffect(() => {
    if (!loading && (!isAuthenticated || userType !== 'admin')) {
      router.push('/login')
      return
    }

    if (!loading && isAuthenticated && userType === 'admin') {
      loadRequests()
    }
  }, [isAuthenticated, userType, loading, filter])

  const loadRequests = async () => {
    try {
      setLoadingRequests(true)
      let query = supabase
        .from('tenant_registration_requests')
        .select(`
          *,
          category:categories(name)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error al cargar solicitudes:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    const confirmed = await confirm({
      title: '¿Aprobar solicitud?',
      description: 'El negocio quedará visible públicamente y el solicitante podrá gestionar su establecimiento. Esta acción no se puede deshacer fácilmente.',
      confirmText: 'Aprobar',
      cancelText: 'Cancelar',
      variant: 'default'
    })
    
    if (!confirmed) return

    try {
      // Obtener la solicitud completa
      const { data: request, error: fetchError } = await supabase
        .from('tenant_registration_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (fetchError || !request) throw fetchError || new Error('Solicitud no encontrada')

      if (!request.applicant_user_id) {
        throw new Error('La solicitud no tiene un usuario asociado')
      }

      // Buscar el negocio creado por este usuario
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', request.applicant_user_id)
        .single()

      if (businessError || !business) {
        throw new Error('No se encontró el negocio asociado a esta solicitud')
      }

      // Actualizar el negocio para aprobarlo y hacerlo visible
      console.log('[APPROVE] Intentando actualizar negocio:', {
        businessId: business.id,
        ownerId: request.applicant_user_id,
        currentStatus: business.approval_status
      })

      const { data: updateResult, error: updateBusinessError } = await supabase
        .from('businesses')
        .update({
          approval_status: 'approved',
          is_publicly_visible: true,
          can_receive_bookings: true,
          // Asegurarse que tenga los datos de la solicitud
          name: request.business_name,
          description: request.business_description,
          category_id: request.business_category_id,
          address: request.business_address,
          city: request.business_city,
          state: request.business_state,
          phone: request.business_phone,
          email: request.business_email || request.applicant_email,
        })
        .eq('id', business.id)
        .select()

      console.log('[APPROVE] Resultado del UPDATE:', {
        success: !updateBusinessError,
        error: updateBusinessError,
        updatedData: updateResult
      })

      if (updateBusinessError) throw updateBusinessError

      if (!updateResult || updateResult.length === 0) {
        throw new Error('El UPDATE no afectó ninguna fila. Posible problema de permisos RLS.')
      }

      // Actualizar la solicitud como aprobada
      const { error: updateError } = await supabase
        .from('tenant_registration_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      if (updateError) throw updateError

      success('Solicitud aprobada. El negocio ahora es visible públicamente')
      loadRequests()
    } catch (error: any) {
      console.error('Error al aprobar solicitud:', error)
      showError('Error: ' + (error.message || 'Error desconocido'))
    }
  }

  const handleReject = async (requestId: string) => {
    const reason = prompt('Ingresa el motivo del rechazo:')
    if (!reason) return

    try {
      // Obtener la solicitud
      const { data: request, error: fetchError } = await supabase
        .from('tenant_registration_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (fetchError || !request) throw fetchError || new Error('Solicitud no encontrada')

      // Actualizar el negocio (si existe) a rechazado
      if (request.applicant_user_id) {
        const { data: business } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', request.applicant_user_id)
          .single()

        if (business) {
          await supabase
            .from('businesses')
            .update({
              approval_status: 'rejected',
              is_publicly_visible: false,
            })
            .eq('id', business.id)
        }
      }

      // Actualizar la solicitud
      const { error } = await supabase
        .from('tenant_registration_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', requestId)

      if (error) throw error

      success('Solicitud rechazada')
      loadRequests()
    } catch (error: any) {
      console.error('Error al rechazar solicitud:', error)
      showError('Error al rechazar solicitud: ' + (error.message || 'Error desconocido'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Cargando...</p>
      </div>
    )
  }

  const filteredRequests = requests

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
            OnTurn Admin
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-blue-200">
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          <Link 
            href="/super-admin/dashboard"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 text-blue-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Clock size={20} /> Dashboard
          </Link>
          <Link 
            href="/super-admin/solicitudes"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors bg-[#00A896] text-white font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Clock size={20} /> Solicitudes
          </Link>
          <Link 
            href="/super-admin/tenants"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 text-blue-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Clock size={20} /> Tenants
          </Link>
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-2 text-blue-200 hover:text-white pt-6 border-t border-blue-900">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-[#003366]">
              <Menu size={28} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-[#003366]">
              Solicitudes de Registro
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
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            size="sm"
          >
            Aprobadas
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
            size="sm"
          >
            Rechazadas
          </Button>
        </div>

        {/* Lista de solicitudes */}
        {loadingRequests ? (
          <p className="text-slate-600">Cargando solicitudes...</p>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">No hay solicitudes {filter !== 'all' ? filter : ''}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.business_name}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {request.applicant_name} • {request.applicant_email}
                      </p>
                      {request.category && (
                        <p className="text-xs text-slate-500 mt-1">
                          Categoría: {request.category.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === 'pending' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                          Pendiente
                        </span>
                      )}
                      {request.status === 'approved' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> Aprobada
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                          <XCircle size={12} /> Rechazada
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {request.business_description && (
                    <p className="text-sm text-slate-700 mb-3">{request.business_description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
                    {request.business_address && (
                      <p><strong>Dirección:</strong> {request.business_address}</p>
                    )}
                    {request.business_city && (
                      <p><strong>Ciudad:</strong> {request.business_city}</p>
                    )}
                    {request.business_phone && (
                      <p><strong>Teléfono:</strong> {request.business_phone}</p>
                    )}
                    {request.business_email && (
                      <p><strong>Email:</strong> {request.business_email}</p>
                    )}
                  </div>
                  {request.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-red-700">
                        <strong>Motivo del rechazo:</strong> {request.rejection_reason}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Button onClick={() => handleApprove(request.id)} variant="default" size="sm">
                          <CheckCircle size={16} className="mr-2" /> Aprobar
                        </Button>
                        <Button onClick={() => handleReject(request.id)} variant="destructive" size="sm">
                          <XCircle size={16} className="mr-2" /> Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Creada: {new Date(request.created_at).toLocaleString('es-ES')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
