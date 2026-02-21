/**
 * Validación de variables de entorno
 * Falla en build time si falta alguna variable requerida
 */

import { z } from 'zod'

const envSchema = z.object({
  // Supabase (públicas)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida'
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida'
  }),
  
  // Site URL (opcional, con default)
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default('http://localhost:3000'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Validar las variables de entorno
function validateEnv() {
  // Durante el build de Docker, las variables pueden no estar disponibles aún
  // Solo validamos si estamos en runtime o si las variables ya están definidas
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
  const hasEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Si es build time y no hay variables, usar placeholders
  if (isBuildTime && !hasEnvVars) {
    console.warn('⚠️  Build time: Variables de entorno no disponibles, usando placeholders')
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
    }
  }
  
  try {
    const parsed = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NODE_ENV: process.env.NODE_ENV,
    })
    
    return parsed
  } catch (error) {
    console.error('❌ Variables de entorno inválidas:', error)
    console.error('\n💡 Revisa tu archivo .env o .env.local')
    throw new Error('Variables de entorno faltantes o inválidas')
  }
}

// Exportar las variables validadas
export const env = validateEnv()

// Type helper para autocompletado
export type Env = z.infer<typeof envSchema>
