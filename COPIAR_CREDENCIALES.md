# 🔑 Copiar Credenciales de Supabase desde CyberCita

Este documento explica cómo copiar las credenciales de Supabase del proyecto CyberCita al proyecto OnTurn.

## Método Automático (Recomendado)

### Paso 1: Ejecutar el Script

Desde la carpeta `onturn-app`, ejecuta:

```bash
npm run copy-credentials
```

Este script:
- ✅ Lee el archivo `.env` del proyecto CyberCita
- ✅ Extrae las credenciales de Supabase (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`)
- ✅ Crea/actualiza el archivo `.env.local` en OnTurn con el formato correcto (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Paso 2: Verificar

El script te mostrará un mensaje de éxito si todo salió bien. El archivo `.env.local` se habrá creado en la raíz de `onturn-app`.

## Método Manual

Si prefieres hacerlo manualmente:

### Paso 1: Leer las Credenciales de CyberCita

Abre el archivo `cybercitas/.env` y busca estas líneas:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_VAPID_PUBLIC_KEY=tu_vapid_key...
```

### Paso 2: Crear .env.local en OnTurn

Crea un archivo llamado `.env.local` en la raíz de `onturn-app` con este contenido:

```env
# Supabase - Credenciales desde CyberCita
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_vapid_key...
```

**Importante:**
- Cambia `VITE_SUPABASE_URL` por `NEXT_PUBLIC_SUPABASE_URL`
- Cambia `VITE_SUPABASE_ANON_KEY` por `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Cambia `VITE_VAPID_PUBLIC_KEY` por `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- Copia los valores exactos (sin comillas)

### Paso 3: Verificar

Asegúrate de que el archivo `.env.local` existe y tiene las credenciales correctas antes de ejecutar `npm run dev`.

## Solución de Problemas

### Error: "No se encontraron las credenciales"

- Verifica que el archivo `cybercitas/.env` existe
- Asegúrate de que las variables se llaman exactamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### Error: "Error al leer el archivo .env"

- Verifica que la ruta al proyecto CyberCita es correcta
- Asegúrate de que el archivo `.env` no esté vacío

### Las credenciales no funcionan

- Verifica que copiaste los valores completos (las claves son muy largas)
- Asegúrate de no tener espacios extra antes o después de los valores
- Verifica que no hay comillas alrededor de los valores en `.env.local`

## Nota de Seguridad

⚠️ **Nunca subas el archivo `.env.local` a Git**. Este archivo ya está en `.gitignore` y contiene información sensible.
