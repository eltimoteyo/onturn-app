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
  
  // Site URL (opcional, con default) - permitir vacío o undefined
  NEXT_PUBLIC_SITE_URL: z.string().url().or(z.literal('')).optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Validar las variables de entorno
function validateEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Si no hay variables, mostrar error claro
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno faltantes:')
    if (!supabaseUrl) console.error('  - NEXT_PUBLIC_SUPABASE_URL no definida')
    if (!supabaseKey) console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY no definida')
    console.error('\n💡 Asegúrate de que el archivo .env existe y contiene:')
    console.error('   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co')
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx')
    
    // En Docker, verificar que se esté pasando al build
    console.error('\n🐳 Si usas Docker, verifica:')
    console.error('   1. Archivo .env existe en el servidor')
    console.error('   2. docker-compose.yml pasa las variables como args')
    console.error('   3. Dockerfile declara ARG y ENV para estas variables')
    
    throw new Error('Variables de entorno faltantes o inválidas')
  }
  
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    
    const parsed = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey,
      NEXT_PUBLIC_SITE_URL: siteUrl || undefined,
      NODE_ENV: process.env.NODE_ENV,
    })
    
    return {
      ...parsed,
      // Proveer default para SITE_URL si no está definido
      NEXT_PUBLIC_SITE_URL: parsed.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  } catch (error) {
    console.error('❌ Variables de entorno inválidas:', error)
    throw new Error('Variables de entorno faltantes o inválidas')
  }
}

// Exportar las variables validadas
export const env = validateEnv()

// Type helper para autocompletado
export type Env = z.infer<typeof envSchema>
