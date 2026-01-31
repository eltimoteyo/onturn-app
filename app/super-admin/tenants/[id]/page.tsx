'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Power, Menu, X, LogOut, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Tenant {
  id: string
  name: string
  slug: string
  owner_id: string
  is_active: boolean
  max_users: number
}

export default function TenantConfigPage() {
  const router = useRouter()
  const params = useParams()
  const tenantId = params.id as string
  const { isAuthenticated, userType, loading, user, logout } = useAuth()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [maxUsers, setMaxUsers] = useState(5)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && (!isAuthenticated || userType !== 'admin')) {
      router.push('/login')
      return
    }

    if (!loading && isAuthenticated && userType === 'admin' && tenantId) {
      loadTenant()
    }
  }, [isAuthenticated, userType, loading, tenantId])

  const loadTenant = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, slug, owner_id, is_active, max_users')
        .eq('id', tenantId)
        .single()

      if (error) throw error
      if (data) {
        setTenant(data)
        setMaxUsers(data.max_users || 5)
        setIsActive(data.is_active)
      }
    } catch (error) {
      console.error('Error al cargar tenant:', error)
      alert('Error al cargar la información del tenant')
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('businesses')
        .update({
          max_users: maxUsers,
          is_active: isActive,
        })
        .eq('id', tenantId)

      if (error) throw error

      alert('Configuración guardada exitosamente')
      router.push('/super-admin/tenants')
    } catch (error: any) {
      console.error('Error al guardar configuración:', error)
      alert('Error al guardar: ' + (error.message || 'Error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Cargando...</p>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Tenant no encontrado</p>
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
            <Power size={20} /> Dashboard
          </Link>
          <Link 
            href="/super-admin/solicitudes"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 text-blue-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Power size={20} /> Solicitudes
          </Link>
          <Link 
            href="/super-admin/tenants"
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/10 text-blue-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Power size={20} /> Tenants
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
            <Link href="/super-admin/tenants">
              <Button variant="ghost" size="sm">
                <ArrowLeft size={16} className="mr-2" /> Volver
              </Button>
            </Link>
            <h2 className="text-xl md:text-2xl font-bold text-[#003366]">
              Configuración: {tenant.name}
            </h2>
          </div>
        </header>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Configuración del Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nombre del Establecimiento
              </label>
              <Input value={tenant.name} disabled className="bg-slate-50" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Slug
              </label>
              <Input value={tenant.slug} disabled className="bg-slate-50" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Límite de Usuarios
              </label>
              <Input
                type="number"
                min="1"
                value={maxUsers}
                onChange={(e) => setMaxUsers(parseInt(e.target.value) || 1)}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                Número máximo de usuarios que puede tener este tenant
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#003366] rounded focus:ring-[#003366]"
                />
                <span className="text-sm font-bold text-slate-700">
                  Establecimiento Activo
                </span>
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-6">
                Si está inactivo, no aparecerá en las búsquedas públicas
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                <Save size={16} className="mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Link href="/super-admin/tenants">
                <Button variant="outline">Cancelar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
