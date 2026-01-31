'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAllCategories } from '@/lib/services/businesses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Mail, Lock, Power, Building2, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import type { Category } from '@/types/business'

export default function RegistroNegocioPage() {
  const router = useRouter()
  const supabase = createClient()

  // Datos del solicitante
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Datos del negocio
  const [businessName, setBusinessName] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [businessCategoryId, setBusinessCategoryId] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessCity, setBusinessCity] = useState('')
  const [businessState, setBusinessState] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getAllCategories()
      setCategories(data || [])
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          setError('Este email ya está registrado. Por favor inicia sesión en su lugar.')
          setTimeout(() => {
            router.push('/admin/login')
          }, 2000)
          return
        }
        throw authError
      }

      if (!authData.user) throw new Error('Error al crear usuario')

      // 2. Crear perfil con rol customer (temporal, será business_owner cuando se apruebe)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          role: 'customer', // Temporal, cambiará a business_owner cuando se apruebe
        })

      if (profileError) throw profileError

      // 3. Crear solicitud de registro de tenant
      const { error: requestError } = await supabase
        .from('tenant_registration_requests')
        .insert({
          applicant_email: email,
          applicant_name: fullName,
          applicant_user_id: authData.user.id,
          business_name: businessName,
          business_description: businessDescription,
          business_category_id: businessCategoryId || null,
          business_address: businessAddress,
          business_city: businessCity,
          business_state: businessState,
          business_phone: businessPhone,
          business_email: businessEmail || email,
          status: 'pending',
        })

      if (requestError) throw requestError

      setSuccess(true)
      setLoading(false)

      // Mostrar mensaje de éxito y redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/admin/login')
      }, 3000)
    } catch (err: any) {
      console.error('Error en registro:', err)
      setError(err.message || 'Error al registrarse')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-900/20">
            <Power size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#003366]">
            Solicitar Registro de Establecimiento
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Completa el formulario para solicitar el registro de tu establecimiento
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
            <p className="font-bold">¡Solicitud enviada exitosamente!</p>
            <p className="text-xs mt-1">Tu solicitud será revisada por un administrador. Te notificaremos cuando sea aprobada.</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Sección: Datos del Solicitante */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-lg font-bold text-[#003366] mb-4">Datos del Solicitante</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                <User size={20} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Nombre Completo"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-transparent outline-none w-full text-[#003366]"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                <Mail size={20} className="text-slate-400" />
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent outline-none w-full text-[#003366]"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 md:col-span-2">
                <Lock size={20} className="text-slate-400" />
                <input
                  type="password"
                  placeholder="Contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="bg-transparent outline-none w-full text-[#003366]"
                />
              </div>
            </div>
          </div>

          {/* Sección: Datos del Establecimiento */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-lg font-bold text-[#003366] mb-4">Datos del Establecimiento</h3>

            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                <Building2 size={20} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Nombre del Establecimiento"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="bg-transparent outline-none w-full text-[#003366]"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <textarea
                  placeholder="Descripción del establecimiento"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={3}
                  className="bg-transparent outline-none w-full text-[#003366] resize-none"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <select
                  value={businessCategoryId}
                  onChange={(e) => setBusinessCategoryId(e.target.value)}
                  className="bg-transparent outline-none w-full text-[#003366]"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                <MapPin size={20} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="bg-transparent outline-none w-full text-[#003366]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={businessCity}
                    onChange={(e) => setBusinessCity(e.target.value)}
                    className="bg-transparent outline-none w-full text-[#003366]"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    placeholder="Estado/Provincia"
                    value={businessState}
                    onChange={(e) => setBusinessState(e.target.value)}
                    className="bg-transparent outline-none w-full text-[#003366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <Phone size={20} className="text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Teléfono del establecimiento"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="bg-transparent outline-none w-full text-[#003366]"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <Mail size={20} className="text-slate-400" />
                  <input
                    type="email"
                    placeholder="Email del establecimiento (opcional)"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="bg-transparent outline-none w-full text-[#003366]"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || success} variant="default">
            {loading ? 'Enviando solicitud...' : success ? 'Solicitud enviada' : 'Enviar Solicitud'}
          </Button>

          <div className="text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/admin/login"
              className="text-[#003366] font-bold hover:underline"
            >
              Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
