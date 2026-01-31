import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Rutas que requieren autenticación
  const protectedRoutes = {
    customer: ['/mis-reservas'],
    business: ['/admin'],
  }

  // Si intenta acceder a /admin sin autenticación (excepto /admin/login que es público)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/admin/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si intenta acceder a /admin pero es cliente (excepto /admin/login que es público)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && session) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      // Si hay error al obtener el perfil o el perfil no existe, permitir acceso
      // El dashboard verificará el rol del lado del cliente
      if (profileError || !profile) {
        // Permitir acceso, el dashboard verificará el rol
        return response
      }

      // Redirigir especialistas a su panel si intentan acceder a otras rutas admin
      if (profile?.role === 'specialist' && !pathname.startsWith('/admin/reservas-especialista')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/admin/reservas-especialista'
        return NextResponse.redirect(redirectUrl)
      }

      // Restringir acceso a configuración para recepcionistas
      if (profile?.role === 'receptionist' && pathname.startsWith('/admin/configuracion')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/admin/dashboard'
        return NextResponse.redirect(redirectUrl)
      }

      // Solo business_owner, specialist y receptionist pueden acceder a /admin
      if (profile?.role !== 'business_owner' && profile?.role !== 'specialist' && profile?.role !== 'receptionist') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/reservas'
        return NextResponse.redirect(redirectUrl)
      }
    } catch (error) {
      // Si hay error, permitir acceso y dejar que el dashboard verifique
      return response
    }
  }

  // PROTECCIÓN CRÍTICA: Si intenta acceder a /super-admin sin autenticación
  if (pathname.startsWith('/super-admin') && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    console.log('[MIDDLEWARE] ❌ SEGURIDAD: Intento de acceso a /super-admin sin autenticación, redirigiendo a /login')
    return NextResponse.redirect(redirectUrl)
  }

  // PROTECCIÓN CRÍTICA: Si intenta acceder a /super-admin con sesión, verificar que sea admin
  if (pathname.startsWith('/super-admin') && session) {
    try {
      console.log('[MIDDLEWARE] 🔒 Verificando acceso a /super-admin para usuario:', session.user.id, 'email:', session.user.email)

      // Intentar obtener el perfil con múltiples intentos si es necesario
      let profile = null
      let profileError = null
      let attempts = 0
      const maxAttempts = 3

      while (attempts < maxAttempts && !profile && !profileError) {
        attempts++
        // console.log(`[MIDDLEWARE] Intento ${attempts}/${maxAttempts} de obtener perfil...`)

        const result = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        profileError = result.error
        profile = result.data

        if (profileError && attempts < maxAttempts) {
          // console.log(`[MIDDLEWARE] Error en intento ${attempts}, reintentando...`)
          await new Promise(resolve => setTimeout(resolve, 100)) // Esperar 100ms antes de reintentar
        }
      }

      // Si hay error al obtener el perfil después de todos los intentos, DENEGAR acceso por seguridad
      if (profileError || !profile) {
        console.error('[MIDDLEWARE] ❌ ERROR DE SEGURIDAD: No se pudo verificar el rol para /super-admin después de', attempts, 'intentos')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/reservas'
        return NextResponse.redirect(redirectUrl)
      }

      // Solo permitir acceso si el rol es 'admin'
      const userRole = profile?.role ? String(profile.role).trim().toLowerCase() : null
      const expectedRole = 'admin'

      if (userRole !== expectedRole) {
        console.error('[MIDDLEWARE] ❌ ERROR DE SEGURIDAD: Usuario con rol', userRole, 'intentó acceder a /super-admin')
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/reservas'
        return NextResponse.redirect(redirectUrl)
      }

      // console.log('[MIDDLEWARE] ✅ Usuario admin autorizado para /super-admin - Rol:', profile.role)
    } catch (error) {
      // En caso de error, DENEGAR acceso por seguridad
      console.error('[MIDDLEWARE] ❌ ERROR DE SEGURIDAD: Error al verificar rol para /super-admin:', error)
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/reservas'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Si intenta acceder a /mis-reservas sin autenticación
  if (pathname.startsWith('/mis-reservas') && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si intenta acceder a /[slug]/reservar sin autenticación
  if (pathname.includes('/reservar') && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
