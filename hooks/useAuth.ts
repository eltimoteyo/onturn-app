'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

type UserType = 'customer' | 'business_owner' | 'admin' | 'specialist' | 'receptionist' | null

// Cliente singleton fuera del hook para evitar recreaciones
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!supabaseClient) {
    console.log('[useAuth] Creando cliente de Supabase (singleton)')
    supabaseClient = createClient()
  }
  return supabaseClient
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const isInitialized = useRef(false)
  const isLoggingIn = useRef(false)

  // Obtener el cliente singleton
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (isInitialized.current) {
      console.log('[useAuth] useEffect ya inicializado, saltando...')
      return
    }

    console.log('[useAuth] useEffect ejecutado (primera vez)')
    isInitialized.current = true
    let mounted = true

    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] getSession completado, session:', session ? 'existe' : 'no existe')
      if (!mounted) return

      setUser(session?.user ?? null)

      if (session?.user) {
        // Obtener tipo de usuario desde profiles en background (sin bloquear)
        const profileQuery = supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT_PROFILE_FETCH')), 10000)
        )

        Promise.race([profileQuery, timeoutPromise])
          .then((result: any) => {
            if (!mounted) return
            const { data, error } = result
            if (error) throw error
            console.log('[useAuth] Perfil obtenido en background, rol:', data?.role)
            setUserType(data?.role as UserType || null)
          })
          .catch((err) => {
            console.error('[useAuth] Error al obtener perfil en background:', err)
            if (!mounted) return
            // Retry logic could go here
          })
          .finally(() => {
            if (mounted) {
              setLoading(false)
              console.log('[useAuth] Loading marcado como false (post-fetch)')
            }
          })
      } else {
        setLoading(false)
        console.log('[useAuth] Loading marcado como false (no session)')
      }
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[useAuth] onAuthStateChange evento:', _event, 'isLoggingIn:', isLoggingIn.current)

      if (!mounted) return

      // Si estamos en proceso de login y es SIGNED_IN, actualizar el estado pero sin re-renderizar mucho
      if (isLoggingIn.current && _event === 'SIGNED_IN') {
        console.log('[useAuth] SIGNED_IN durante login, actualizando usuario pero esperando a que termine el login')
        setUser(session?.user ?? null)
        // Obtener perfil en background sin bloquear
        if (session?.user) {
          supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (!mounted) return
              console.log('[useAuth] Perfil obtenido después de SIGNED_IN:', data?.role)
              setUserType(data?.role as UserType || null)
            })
            .catch((err) => {
              console.error('[useAuth] Error al obtener perfil después de SIGNED_IN:', err)
              if (!mounted) return
              setUserType(null)
            })
        }
        return
      }

      // Solo actualizar si realmente cambió el usuario
      const currentUserId = user?.id
      const newUserId = session?.user?.id

      if (currentUserId !== newUserId) {
        console.log('[useAuth] Usuario cambió, actualizando estado')
        setUser(session?.user ?? null)

        if (session?.user) {
          const profileQuery = supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          // Aumentar timeout a 15s para conexiones lentas
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_PROFILE_FETCH_AUTH_CHANGE')), 15000)
          )

          try {
            const result: any = await Promise.race([profileQuery, timeoutPromise])

            if (!mounted) return

            const { data, error } = result
            if (error) {
              console.error('[useAuth] Error fetch profile:', error)
            }

            console.log('[useAuth] Perfil obtenido:', data?.role)
            setUserType(data?.role as UserType || null)
          } catch (err) {
            console.error('[useAuth] Excepción al obtener perfil:', err)
            if (!mounted) return

            console.log('[useAuth] Reintentando obtener perfil sin race condition...')
            // Retry simple
            profileQuery.then(({ data }) => {
              if (mounted && data?.role) setUserType(data.role as UserType)
            })
          }
        } else {
          setUserType(null)
        }
      } else {
        console.log('[useAuth] Usuario no cambió, ignorando evento')
      }
    })

    return () => {
      console.log('[useAuth] Limpiando useEffect')
      mounted = false
      isInitialized.current = false
      subscription.unsubscribe()
    }
  }, []) // Sin dependencias para que solo se ejecute una vez

  const login = useCallback(async (email: string, password: string, redirect?: string) => {
    console.log('[LOGIN] ========== INICIANDO LOGIN ==========')
    console.log('[LOGIN] Email:', email)
    console.log('[LOGIN] Redirect proporcionado:', redirect)

    // Marcar que estamos en proceso de login
    isLoggingIn.current = true
    console.log('[LOGIN] isLoggingIn marcado como true')

    try {
      console.log('[LOGIN] Paso 1: Llamando a signInWithPassword...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('[LOGIN] Paso 1: Completado. Error:', error ? 'SI' : 'NO')
      console.log('[LOGIN] Paso 1: Data existe:', data ? 'SI' : 'NO')

      if (error) {
        console.error('[LOGIN] Error en signInWithPassword:', error)
        isLoggingIn.current = false
        throw error
      }

      console.log('[LOGIN] Paso 2: Login exitoso!')
      console.log('[LOGIN] Paso 2: Usuario ID:', data.user.id)

      // Simplificar: usar el redirect proporcionado directamente
      // Si viene de /admin/login, el redirect ya es /admin/dashboard
      let redirectPath = redirect || '/reservas'

      console.log('[LOGIN] Paso 3: Determinando ruta de redirección...')
      console.log('[LOGIN] Paso 3: Redirect proporcionado:', redirect)
      console.log('[LOGIN] Paso 3: RedirectPath inicial:', redirectPath)

      // Intentar obtener perfil para determinar redirección según rol
      console.log('[LOGIN] Paso 3: Intentando obtener perfil para determinar redirección...')
      console.log('[LOGIN] Paso 3: User ID:', data.user.id)

      try {
        // Obtener perfil con timeout para evitar que se quede colgado
        const profilePromise = supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout obteniendo perfil')), 5000)
        )

        console.log('[LOGIN] Paso 3: Esperando respuesta del perfil...')
        const profileResult = await Promise.race([profilePromise, timeoutPromise]) as any

        console.log('[LOGIN] Paso 3: Profile query completado')
        console.log('[LOGIN] Paso 3: Profile result completo:', JSON.stringify(profileResult, null, 2))

        const profileError = profileResult?.error
        const profile = profileResult?.data

        console.log('[LOGIN] Paso 3: Profile error:', profileError ? JSON.stringify(profileError, null, 2) : 'ninguno')
        console.log('[LOGIN] Paso 3: Profile data:', JSON.stringify(profile, null, 2))
        console.log('[LOGIN] Paso 3: Profile role:', profile?.role)
        console.log('[LOGIN] Paso 3: User ID:', data.user.id)
        console.log('[LOGIN] Paso 3: User Email:', data.user.email)

        if (profileError) {
          console.error('[LOGIN] ❌ ERROR: Error al obtener perfil:', JSON.stringify(profileError, null, 2))
          console.error('[LOGIN] User ID que causó el error:', data.user.id)
          // Continuar con redirect por defecto si hay error
          redirectPath = redirect || '/reservas'
        } else if (profile) {
          // Normalizar el rol para comparación robusta
          const userRole = profile.role ? String(profile.role).trim().toLowerCase() : null

          console.log('[LOGIN] Paso 3: Comparando rol:')
          console.log('[LOGIN] Paso 3: - Rol obtenido (raw):', profile.role)
          console.log('[LOGIN] Paso 3: - Rol obtenido (normalizado):', userRole)
          console.log('[LOGIN] Paso 3: - Tipo del rol:', typeof profile.role)

          // Redirigir según el rol del usuario
          if (userRole === 'admin') {
            redirectPath = '/super-admin/dashboard'
            console.log('[LOGIN] Paso 3: ✅ Usuario es ADMIN, redirigiendo a /super-admin/dashboard')
          } else if (userRole === 'business_owner') {
            redirectPath = '/admin/dashboard'
            console.log('[LOGIN] Paso 3: ✅ Usuario es business_owner, redirigiendo a /admin/dashboard')
          } else if (userRole === 'specialist') {
            redirectPath = '/admin/reservas-especialista'
            console.log('[LOGIN] Paso 3: ✅ Usuario es specialist, redirigiendo a /admin/reservas-especialista')
          } else if (userRole === 'receptionist') {
            redirectPath = '/admin/dashboard'
            console.log('[LOGIN] Paso 3: ✅ Usuario es receptionist, redirigiendo a /admin/dashboard')
          } else {
            console.log('[LOGIN] Paso 3: ⚠️ Rol desconocido o null:', userRole, '(raw:', profile.role, ')')
            redirectPath = redirect || '/reservas'
          }
        } else {
          console.log('[LOGIN] Paso 3: ⚠️ No se obtuvo perfil, usando redirect por defecto')
          console.log('[LOGIN] Paso 3: Profile es null o undefined')
          redirectPath = redirect || '/reservas'
        }
      } catch (err: any) {
        console.error('[LOGIN] Paso 3: ❌ Error al obtener perfil:', err)
        console.log('[LOGIN] Paso 3: Usando redirect proporcionado o default debido a error')
        // Si hay un redirect específico, usarlo; si no, usar el default
        redirectPath = redirect || '/reservas'
      }

      console.log('[LOGIN] Paso 3: ✅ Redirección determinada:', redirectPath)

      console.log('[LOGIN] Paso 4: Ruta final de redirección:', redirectPath)
      console.log('[LOGIN] Paso 4: window existe:', typeof window !== 'undefined')
      console.log('[LOGIN] Paso 4: window.location.pathname:', typeof window !== 'undefined' ? window.location.pathname : 'N/A')

      // Redirigir inmediatamente
      if (typeof window !== 'undefined') {
        console.log('[LOGIN] Paso 5: REDIRIGIENDO AHORA a:', redirectPath)
        console.log('[LOGIN] Paso 5: Antes de redirigir, pathname:', window.location.pathname)

        // Redirigir inmediatamente sin timeout
        window.location.href = redirectPath
        console.log('[LOGIN] Paso 5: window.location.href asignado, debería redirigir ahora')

        // Marcar que terminamos el login después de un breve delay
        setTimeout(() => {
          isLoggingIn.current = false
        }, 1000)
      } else {
        console.error('[LOGIN] Paso 5: window no está disponible!')
        isLoggingIn.current = false
      }

      console.log('[LOGIN] ========== LOGIN COMPLETADO ==========')
      return { user: data.user, userType: null }
    } catch (err) {
      console.error('[LOGIN] ========== ERROR EN LOGIN ==========')
      console.error('[LOGIN] Error:', err)
      isLoggingIn.current = false
      throw err
    }
  }, [supabase])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return {
    user,
    userType,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isCustomer: userType === 'customer',
    isBusinessOwner: userType === 'business_owner',
    isAdmin: userType === 'admin',
    isSpecialist: userType === 'specialist',
    isReceptionist: userType === 'receptionist',
  }
}
