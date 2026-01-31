/**
 * Script de verificación de configuración
 * Verifica que todas las variables de entorno estén configuradas correctamente
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando configuración de OnTurn...\n')

const envLocalPath = path.join(__dirname, '../.env.local')
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

let errors = []
let warnings = []

// Verificar que existe .env.local
if (!fs.existsSync(envLocalPath)) {
  errors.push('❌ El archivo .env.local no existe')
  errors.push('   Ejecuta: npm run copy-credentials')
} else {
  console.log('✅ Archivo .env.local encontrado\n')
  
  // Leer y verificar variables
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        const cleanValue = value.replace(/^["']|["']$/g, '')
        envVars[key.trim()] = cleanValue
      }
    }
  })
  
  // Verificar cada variable requerida
  requiredVars.forEach(varName => {
    const value = envVars[varName]
    if (!value || value === 'your_supabase_url' || value === 'your_supabase_anon_key') {
      errors.push(`❌ ${varName} no está configurada o tiene un valor por defecto`)
    } else {
      // Validar formato básico
      if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && !value.startsWith('http')) {
        errors.push(`❌ ${varName} no parece ser una URL válida`)
      } else if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !value.startsWith('eyJ')) {
        warnings.push(`⚠️  ${varName} no parece tener el formato correcto (debe empezar con 'eyJ')`)
      } else {
        console.log(`✅ ${varName} configurada correctamente`)
      }
    }
  })
  
  // Verificar VAPID (opcional pero recomendado)
  if (!envVars.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    warnings.push('⚠️  NEXT_PUBLIC_VAPID_PUBLIC_KEY no está configurada (opcional para notificaciones push)')
  } else {
    console.log('✅ NEXT_PUBLIC_VAPID_PUBLIC_KEY configurada')
  }
}

// Verificar estructura de carpetas
const requiredDirs = [
  'app',
  'components',
  'lib',
  'hooks',
  'types',
]

console.log('\n📁 Verificando estructura de carpetas...')
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir)
  if (fs.existsSync(dirPath)) {
    console.log(`✅ Carpeta ${dir}/ existe`)
  } else {
    errors.push(`❌ Carpeta ${dir}/ no existe`)
  }
})

// Verificar archivos importantes
const requiredFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'middleware.ts',
]

console.log('\n📄 Verificando archivos importantes...')
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`)
  } else {
    errors.push(`❌ ${file} no existe`)
  }
})

// Mostrar resultados
console.log('\n' + '='.repeat(50))

if (errors.length > 0) {
  console.log('\n❌ ERRORES ENCONTRADOS:\n')
  errors.forEach(error => console.log(`  ${error}`))
  console.log('\n💡 Soluciones:')
  console.log('  1. Ejecuta: npm run copy-credentials')
  console.log('  2. Verifica que el archivo .env.local tenga las credenciales correctas')
  console.log('  3. Asegúrate de que todos los archivos estén presentes\n')
  process.exit(1)
} else {
  console.log('\n✅ ¡Toda la configuración está correcta!\n')
  
  if (warnings.length > 0) {
    console.log('⚠️  ADVERTENCIAS:\n')
    warnings.forEach(warning => console.log(`  ${warning}`))
    console.log()
  }
  
  console.log('🚀 Puedes ejecutar: npm run dev\n')
  process.exit(0)
}
