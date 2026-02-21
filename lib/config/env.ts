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
    console.error('\n💡 Revisa tu archivo .env.local')
    throw new Error('Variables de entorno faltantes o inválidas')
  }
}

// Exportar las variables validadas
export const env = validateEnv()

// Type helper para autocompletado
export type Env = z.infer<typeof envSchema>
