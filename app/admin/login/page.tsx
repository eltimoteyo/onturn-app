'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { User, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  console.log('[ADMIN_LOGIN_PAGE] Componente renderizado')
  const router = useRouter()
  const { login } = useAuth()
  console.log('[ADMIN_LOGIN_PAGE] useAuth hook obtenido, login function:', typeof login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  console.log('[ADMIN_LOGIN_PAGE] Estados inicializados - loading:', loading, 'error:', error)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password, '/admin/dashboard')
      // No cambiar loading aquí, la redirección se encargará
      // window.location.href forzará un reload completo de la página
    } catch (err: any) {
      console.error('Error en login:', err)
      setError(err.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900/60 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#003366] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-900/20">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#003366]">
            Iniciar Sesión
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Accede para gestionar tus reservas
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

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

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
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

          <Button type="submit" className="w-full" disabled={loading} variant="default">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          <div className="text-center text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <Link
              href="/registro-negocio"
              className="text-[#003366] font-bold hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
