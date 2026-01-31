/**
 * Script para copiar las credenciales de Supabase desde CyberCita a OnTurn
 * 
 * Uso:
 * node scripts/copy-supabase-credentials.js
 * 
 * Este script lee el archivo .env del proyecto CyberCita y crea/actualiza
 * el archivo .env.local de OnTurn con las mismas credenciales.
 */

const fs = require('fs')
const path = require('path')

const cybercitasEnvPath = path.join(__dirname, '../../cybercitas/.env')
const onturnEnvPath = path.join(__dirname, '../.env.local')

console.log('🔍 Buscando credenciales de Supabase en CyberCita...\n')

// Leer el archivo .env de CyberCita
let cybercitasEnv = {}
try {
  const envContent = fs.readFileSync(cybercitasEnvPath, 'utf8')
  
  // Parsear el archivo .env
  envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        // Remover comillas si las hay
        const cleanValue = value.replace(/^["']|["']$/g, '')
        cybercitasEnv[key.trim()] = cleanValue
      }
    }
  })
  
  console.log('✅ Archivo .env de CyberCita leído correctamente\n')
} catch (error) {
  console.error('❌ Error al leer el archivo .env de CyberCita:')
  console.error(`   Ruta: ${cybercitasEnvPath}`)
  console.error(`   Error: ${error.message}\n`)
  console.log('💡 Asegúrate de que el archivo .env existe en el proyecto CyberCita')
  process.exit(1)
}

// Extraer las credenciales de Supabase
const supabaseUrl = cybercitasEnv.VITE_SUPABASE_URL || cybercitasEnv.SUPABASE_URL
const supabaseAnonKey = cybercitasEnv.VITE_SUPABASE_ANON_KEY || cybercitasEnv.SUPABASE_ANON_KEY
const vapidKey = cybercitasEnv.VITE_VAPID_PUBLIC_KEY || cybercitasEnv.VAPID_PUBLIC_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ No se encontraron las credenciales de Supabase en el archivo .env')
  console.error('   Buscando: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY\n')
  process.exit(1)
}

console.log('📋 Credenciales encontradas:')
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 30)}...`)
if (vapidKey) {
  console.log(`   VAPID Key: ${vapidKey.substring(0, 30)}...`)
}
console.log()

// Crear el contenido del archivo .env.local para OnTurn
const onturnEnvContent = `# Supabase - Credenciales copiadas desde CyberCita
# Generado automáticamente el ${new Date().toLocaleString('es-ES')}

NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
${vapidKey ? `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKey}` : '# NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_vapid_public_key'}
`

// Escribir el archivo .env.local
try {
  fs.writeFileSync(onturnEnvPath, onturnEnvContent, 'utf8')
  console.log('✅ Archivo .env.local creado/actualizado en OnTurn')
  console.log(`   Ruta: ${onturnEnvPath}\n`)
  console.log('🎉 ¡Credenciales copiadas exitosamente!')
  console.log('   Ahora puedes ejecutar: npm run dev\n')
} catch (error) {
  console.error('❌ Error al escribir el archivo .env.local:')
  console.error(`   Error: ${error.message}\n`)
  process.exit(1)
}
