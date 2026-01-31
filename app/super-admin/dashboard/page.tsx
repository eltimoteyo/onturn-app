'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, Clock, FileText, Power, Menu, X, LogOut, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface RegistrationRequest {
  id: string
  applicant_email: string
  applicant_name: string
  business_name: string
  business_description: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface Tenant {
  id: string
  name: string
  owner_id: string
  is_active: boolean
  max_users: number
  created_at: string
}

export default function SuperAdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, userType, loading, user, logout } = useAuth()
  const [supabase] = useState(() => createClient())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [checkingRole, setCheckingRole] = useState(false)
  const [roleVerified, setRoleVerified] = useState(false)
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    pendingRequests: 0,
    totalUsers: 0,
  })
  const [pendingRequests, setPendingRequests] = useState<RegistrationRequest[]>([])
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([])

  useEffect(() => {
    console.log('[SUPER_ADMIN_DASHBOARD] useEffect ejecutado')
    console.log('[SUPER_ADMIN_DASHBOARD] loading:', loading)
    console.log('[SUPER_ADMIN_DASHBOARD] isAuthenticated:', isAuthenticated)
    console.log('[SUPER_ADMIN_DASHBOARD] user:', user ? `existe (${user.id})` : 'no existe')
    console.log('[SUPER_ADMIN_DASHBOARD] roleVerified:', roleVerified)

    // Si ya verificamos el rol y es válido, no hacer nada más
    if (roleVerified) {
      console.log('[SUPER_ADMIN_DASHBOARD] Rol ya verificado, saltando...')
      return
    }

    // Si no hay usuario, esperar un poco más o redirigir
    if (!user) {
      if (!loading) {
        // Si ya terminó de cargar y no hay usuario, redirigir
        console.log('[SUPER_ADMIN_DASHBOARD] No hay usuario después de cargar, redirigiendo a login')
        router.push('/login')
      }
      return
    }

    // Verificar el rol usando la información que YA tiene useAuth
    // Esto evita hacer un query adicional que causa timeouts en reloads rápidos
    const verifyAndLoad = async () => {
      // Si ya verificamos y es válido, salir
      if (roleVerified) return

      console.log('[SUPER_ADMIN_DASHBOARD] 🔍 Verificando rol via useAuth...', userType)

      if (userType === 'admin') {
        console.log('[SUPER_ADMIN_DASHBOARD] ✅ Rol admin confirmado por useAuth')
        setRoleVerified(true)
        setCheckingRole(false)

        try {
          console.log('[SUPER_ADMIN_DASHBOARD] 📥 Cargando datos del dashboard...')
          await Promise.all([
            loadStats(),
            loadPendingRequests(),
            loadRecentTenants()
          ])
          console.log('[SUPER_ADMIN_DASHBOARD] ✅ Datos cargados')
        } catch (e) {
          console.error('[SUPER_ADMIN_DASHBOARD] ❌ Error cargando datos:', e)
        }
        return
      }

      // Si tenemos usuario pero useAuth dice que NO es admin
      if (userType && userType !== 'admin') {
        console.error('[SUPER_ADMIN_DASHBOARD] ❌ Acceso denegado: Rol es', userType)
        router.push('/reservas')
        return
      }

      // Si userType es null/undefined pero hay usuario, useAuth sique cargando el perfil internamente.
      // Dejamos que el loading UI siga mostrándose.
    }

    verifyAndLoad()
  }, [user, router, roleVerified, loading, isAuthenticated, userType, checkingRole])

  const loadStats = async () => {
    try {
      console.log('[SUPER_ADMIN_DASHBOARD] Cargando estadísticas...')
      const [tenantsResult, requestsResult] = await Promise.all([
        supabase.from('businesses').select('id, is_active', { count: 'exact' }),
        supabase.from('tenant_registration_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      ])

      console.log('[SUPER_ADMIN_DASHBOARD] Resultados obtenidos:', { tenantsResult, requestsResult })

      const totalTenants = tenantsResult.count || 0
      const activeTenants = tenantsResult.data?.filter(t => t.is_active).length || 0
      const pendingRequests = requestsResult.count || 0

      setStats({
        totalTenants,
        activeTenants,
        pendingRequests,
        totalUsers: 0, // TODO: Contar usuarios totales
      })
      console.log('[SUPER_ADMIN_DASHBOARD] Estadísticas cargadas:', { totalTenants, activeTenants, pendingRequests })
    } catch (error) {
      console.error('[SUPER_ADMIN_DASHBOARD] Error al cargar estadísticas:', error)
    }
  }

  const loadPendingRequests = async () => {
    try {
      console.log('[SUPER_ADMIN_DASHBOARD] Cargando solicitudes pendientes...')
      const { data, error } = await supabase
        .from('tenant_registration_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('[SUPER_ADMIN_DASHBOARD] Error al cargar solicitudes:', error)
        throw error
      }
      console.log('[SUPER_ADMIN_DASHBOARD] Solicitudes cargadas:', data?.length || 0)
      setPendingRequests(data || [])
    } catch (error) {
      console.error('[SUPER_ADMIN_DASHBOARD] Error al cargar solicitudes pendientes:', error)
    }
  }

  const loadRecentTenants = async () => {
    try {
      console.log('[SUPER_ADMIN_DASHBOARD] Cargando tenants recientes...')
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, owner_id, is_active, max_users, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('[SUPER_ADMIN_DASHBOARD] Error al cargar tenants:', error)
        throw error
      }
      console.log('[SUPER_ADMIN_DASHBOARD] Tenants cargados:', data?.length || 0)
      setRecentTenants(data || [])
    } catch (error) {
      console.error('[SUPER_ADMIN_DASHBOARD] Error al cargar tenants recientes:', error)
    }
  }

  // Mostrar carga solo si estamos verificando el rol o si no hay usuario aún
  // IMPORTANTE: Solo mostrar el dashboard si el rol fue verificado como 'admin'
  if (!user || checkingRole || !roleVerified) {
    console.log('[SUPER_ADMIN_DASHBOARD] Mostrando pantalla de carga - user:', user ? 'existe' : 'no existe', 'checkingRole:', checkingRole, 'roleVerified:', roleVerified)
    // Timeout visual si tarda mucho
    setTimeout(() => {
      const el = document.getElementById('loading-debug');
      if (el) el.style.display = 'block';
    }, 5000);

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto"></div>
          <p className="text-slate-600 font-medium text-lg">
            {!user ? 'Cargando sesión...' : 'Verificando permisos de administrador...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row relative">
      {/* Overlay para cerrar menú móvil */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Admin General */}
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
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors bg-[#00A896] text-white font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FileText size={20} /> Dashboard
          </Link>
          <Link
            href="/super-admin/solicitudes"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 text-blue-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Clock size={20} /> Solicitudes
          </Link>
          <Link
            href="/super-admin/tenants"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 text-blue-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Building2 size={20} /> Tenants
          </Link>
        </nav>
        <button onClick={logout} className="mt-auto flex items-center gap-2 text-blue-200 hover:text-white pt-6 border-t border-blue-900">
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-[#003366]">
              <Menu size={28} />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-[#003366]">
              Panel de Administración General
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">Admin General</span>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
              {user?.email?.[0].toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-100 p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Total Tenants</p>
            <p className="text-xl md:text-2xl font-bold text-[#003366]">{stats.totalTenants}</p>
          </Card>
          <Card className="bg-green-50 border-green-100 p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Activos</p>
            <p className="text-xl md:text-2xl font-bold text-green-700">{stats.activeTenants}</p>
          </Card>
          <Card className="bg-yellow-50 border-yellow-100 p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Pendientes</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-700">{stats.pendingRequests}</p>
          </Card>
          <Card className="bg-purple-50 border-purple-100 p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Usuarios</p>
            <p className="text-xl md:text-2xl font-bold text-purple-700">{stats.totalUsers}</p>
          </Card>
        </div>

        {/* Solicitudes Pendientes */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Solicitudes Pendientes</CardTitle>
              <Link href="/super-admin/solicitudes">
                <Button variant="outline" size="sm">Ver todas</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-slate-500 text-sm">No hay solicitudes pendientes</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-bold text-[#003366]">{request.business_name}</p>
                      <p className="text-sm text-slate-600">{request.applicant_name} - {request.applicant_email}</p>
                    </div>
                    <Link href={`/super-admin/solicitudes/${request.id}`}>
                      <Button size="sm">Revisar</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenants Recientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tenants Recientes</CardTitle>
              <Link href="/super-admin/tenants">
                <Button variant="outline" size="sm">Ver todos</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTenants.length === 0 ? (
              <p className="text-slate-500 text-sm">No hay tenants registrados</p>
            ) : (
              <div className="space-y-3">
                {recentTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-bold text-[#003366]">{tenant.name}</p>
                      <p className="text-sm text-slate-600">
                        {tenant.is_active ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={14} /> Activo
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <XCircle size={14} /> Inactivo
                          </span>
                        )}
                        {' • '}Límite usuarios: {tenant.max_users}
                      </p>
                    </div>
                    <Link href={`/super-admin/tenants/${tenant.id}`}>
                      <Button size="sm" variant="outline">Configurar</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
