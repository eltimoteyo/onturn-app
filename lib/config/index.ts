/**
 * Configuración centralizada de la aplicación
 * Importa y valida variables de entorno
 */

import { env } from './env'

// Re-exportar las variables validadas
export { env }

// Exportar constantes derivadas
export const config = {
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  site: {
    url: env.NEXT_PUBLIC_SITE_URL,
  },
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
} as const

export type Config = typeof config
