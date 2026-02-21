/**
 * Sistema centralizado de manejo de errores
 * Convierte errores técnicos en mensajes amigables para el usuario
 */

/**
 * Estructura de error procesado
 */
export interface ProcessedError {
  message: string // Mensaje técnico (para logs)
  userMessage: string // Mensaje amigable para mostrar al usuario
  code?: string // Código de error si está disponible
}

/**
 * Convierte errores de Supabase en mensajes amigables
 */
function getSupabaseErrorMessage(error: any): string {
  const message = error.message || ''
  const code = error.code || ''

  // Errores de permisos
  if (code === 'PGRST116' || message.includes('PGRST116')) {
    return 'No se encontró el recurso solicitado'
  }

  if (code === '42501' || message.includes('permission denied')) {
    return 'No tienes permisos para realizar esta acción'
  }

  // Errores de unicidad
  if (code === '23505' || message.includes('unique constraint')) {
    return 'Este registro ya existe. Por favor usa valores diferentes.'
  }

  // Errores de relaciones
  if (code === '23503' || message.includes('foreign key')) {
    return 'No se puede eliminar porque hay otros elementos relacionados'
  }

  // Errores de autenticación
  if (message.includes('Invalid login credentials')) {
    return 'Credenciales incorrectas. Verifica tu email y contraseña.'
  }

  if (message.includes('Email not confirmed')) {
    return 'Por favor confirma tu email antes de continuar'
  }

  if (message.includes('User already registered')) {
    return 'Este email ya está registrado. ¿Olvidaste tu contraseña?'
  }

  // Error de red
  if (message.includes('Failed to fetch') || message.includes('Network')) {
    return 'Error de conexión. Verifica tu internet e intenta de nuevo.'
  }

  return 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
}

/**
 * Procesa un error y retorna información estructurada
 * 
 * @param error - El error capturado
 * @param context - Contexto opcional para logging (ej: 'CREATE_BUSINESS')
 * @returns Objeto con mensaje técnico y mensaje para usuario
 */
export function handleError(error: unknown, context?: string): ProcessedError {
  // Obtener mensaje técnico
  const technicalMessage = error instanceof Error ? error.message : String(error)
  
  // Log en consola con contexto
  if (context) {
    console.error(`[ERROR:${context}]`, error)
  } else {
    console.error('[ERROR]', error)
  }

  // Si podemos capturar con Sentry/similar en el futuro
  // Sentry.captureException(error, { tags: { context } })

  // Generar mensaje amigable
  const userMessage = error instanceof Error 
    ? getSupabaseErrorMessage(error)
    : 'Ocurrió un error inesperado. Por favor intenta de nuevo.'

  return {
    message: technicalMessage,
    userMessage,
    code: (error as any)?.code,
  }
}

/**
 * Helper para mostrar error con Toast
 * Requiere que exista el hook useToast en el componente
 * 
 * @example
 * ```typescript
 * import { handleError } from '@/lib/utils/errorHandler'
 * 
 * try {
 *   await createBusiness(data)
 * } catch (error) {
 *   const { userMessage } = handleError(error, 'CREATE_BUSINESS')
 *   toast.error(userMessage)
 * }
 * ```
 */
export function getErrorMessage(error: unknown, context?: string): string {
  return handleError(error, context).userMessage
}
