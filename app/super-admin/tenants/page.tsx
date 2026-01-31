'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Power, Menu, X, LogOut, CheckCircle, XCircle, Settings, Search } from 'lucide-react'
import Link from 'next/link'

interface Tenant {
  id: string
  name: string
  slug: string
  owner_id: string
  is_active: boolean
  max_users: number
  city: string | null
  created_at: string
  owner?: {
    email: string
    full_name: string
  }
}

export default function TenantsPage() {
  const router = useRouter()
  const { isAuthenticated, userType, loading, user, logout } = useAuth()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loadingTenants, setLoadingTenants] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!loading && (!isAuthenticated || userType !== 'admin')) {
      router.push('/login')
      return
    }

    if (!loading && isAuthenticated && userType === 'admin') {
      loadTenants()
    }
  }, [isAuthenticated, userType, loading])

  const loadTenants = async () => {
    try {
      setLoadingTenants(true)
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          slug,
          owner_id,
          is_active,
          max_users,
          city,
          created_at,
          owner:profiles!businesses_owner_id_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTenants(data || [])
    } catch (error) {
      console.error('Error al cargar tenants:', error)
    } finally {
      setLoadingTenants(false)
    }
  }

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.city?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <Building2 size={20} /> Dashboard
          </Link>
          <Link 
            href="/super-admin/solicitudes"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 text-blue-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Building2 size={20} /> Solicitudes
          </Link>
          <Link 
            href="/super-admin/tenants"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors bg-[#00A896] text-white font-bold"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Building2 size={20} /> Tenants
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
              Gestión de Tenants
            </h2>
          </div>
        </header>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366]"
            />
          </div>
        </div>

        {/* Lista de tenants */}
        {loadingTenants ? (
          <p className="text-slate-600">Cargando tenants...</p>
        ) : filteredTenants.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-slate-500">No hay tenants registrados</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    {tenant.is_active ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <XCircle size={12} /> Inactivo
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    {tenant.city && (
                      <p><strong>Ciudad:</strong> {tenant.city}</p>
                    )}
                    {tenant.owner && (
                      <p><strong>Admin:</strong> {tenant.owner.full_name || tenant.owner.email}</p>
                    )}
                    <p><strong>Límite usuarios:</strong> {tenant.max_users}</p>
                    <p><strong>Slug:</strong> {tenant.slug}</p>
                  </div>
                  <Link href={`/super-admin/tenants/${tenant.id}`}>
                    <Button className="w-full" size="sm">
                      <Settings size={16} className="mr-2" /> Configurar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
