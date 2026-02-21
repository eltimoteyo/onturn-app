# ⚡ Quick Wins - Mejoras Rápidas para OnTurn

> **Tareas de alto impacto que se pueden completar en < 2 horas cada una**

---

## 🎯 QUICK WIN #1: Mejorar Error Handling (30 min)

### Problema
Console.error por todos lados, alerts genéricos

### Solución
```typescript
// lib/utils/errorHandler.ts
export function handleError(error: unknown, context?: string) {
  const message = error instanceof Error ? error.message : 'Error desconocido'
  console.error(`[${context || 'ERROR'}]`, error)
  
  // Si tienes Sentry configurado:
  // Sentry.captureException(error)
  
  return {
    message,
    userMessage: getUserFriendlyMessage(error)
  }
}

function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('PGRST116')) return 'No se encontró el recurso'
    if (error.message.includes('unique constraint')) return 'Este registro ya existe'
    if (error.message.includes('permission')) return 'No tienes permisos para esta acción'
  }
  return 'Ocurrió un error. Por favor intenta de nuevo.'
}
```

**Uso:**
```typescript
// ANTES
try {
  await supabase.from('businesses').insert(data)
} catch (error: any) {
  console.error(error)
  alert('Error: ' + error.message)
}

// DESPUÉS
try {
  await supabase.from('businesses').insert(data)
} catch (error) {
  const { userMessage } = handleError(error, 'CREATE_BUSINESS')
  toast.error(userMessage)
}
```

---

## 🎯 QUICK WIN #2: Loading States Consistentes (45 min)

### Problema
Algunos componentes tienen skeletons, otros no

### Solución
Crear componente genérico:

```typescript
// components/shared/LoadingState.tsx
interface LoadingStateProps {
  type: 'card' | 'table' | 'list'
  count?: number
}

export function LoadingState({ type, count = 3 }: LoadingStateProps) {
  if (type === 'card') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  // ... otros tipos
}
```

**Uso:**
```typescript
{loading ? (
  <LoadingState type="card" count={6} />
) : (
  <BusinessList businesses={businesses} />
)}
```

---

## 🎯 QUICK WIN #3: Empty States Bonitos (30 min)

### Problema
Solo muestra "No hay datos"

### Solución
```typescript
// components/shared/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-slate-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

**Uso:**
```typescript
{businesses.length === 0 ? (
  <EmptyState
    icon={<Building2 className="h-16 w-16" />}
    title="No hay establecimientos"
    description="Aún no se han registrado establecimientos en esta categoría"
    action={{ label: "Ver todos", onClick: () => router.push('/reservas') }}
  />
) : (
  <BusinessList businesses={businesses} />
)}
```

---

## 🎯 QUICK WIN #4: TypeScript Strict Mode (15 min)

### Problema
Algunos tipos son `any`

### Solución
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

Luego ejecutar:
```bash
npm run build
```

Y corregir errores uno por uno.

---

## 🎯 QUICK WIN #5: Componente de Confirmación (45 min)

### Problema
Usar `confirm()` nativo es feo

### Solución
```typescript
// hooks/useConfirm.ts
import { useState } from 'react'

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    description: string
    onConfirm: () => void
  } | null>(null)

  const confirm = (title: string, description: string, onConfirm: () => void) => {
    setConfig({ title, description, onConfirm })
    setIsOpen(true)
    return new Promise((resolve) => {
      // ...
    })
  }

  return { confirm, isOpen, setIsOpen, config }
}
```

**Uso:**
```typescript
const { confirm } = useConfirm()

const handleDelete = async (id: string) => {
  await confirm(
    '¿Eliminar especialista?',
    'Esta acción no se puede deshacer.'
  )
  // Si llegó aquí, el usuario confirmó
  await deleteSpecialist(id)
}
```

---

## 🎯 QUICK WIN #6: Next.js Image Optimization (1 hora)

### Problema
Usar <img> en lugar de <Image>

### Solución
```typescript
// ANTES
<img src={business.logo} alt={business.name} />

// DESPUÉS
import Image from 'next/image'

<Image 
  src={business.logo || '/placeholder.png'} 
  alt={business.name}
  width={200}
  height={200}
  className="rounded-lg"
  loading="lazy"
/>
```

**Beneficios:**
- Lazy loading automático
- Optimización de tamaño
- WebP automático
- Mejor performance

---

## 🎯 QUICK WIN #7: Debounce en Búsquedas (20 min)

### Problema
Cada tecla hace una query

### Solución
```bash
npm install use-debounce
```

```typescript
import { useDebouncedValue } from 'use-debounce'

const [searchTerm, setSearchTerm] = useState('')
const [debouncedSearch] = useDebouncedValue(searchTerm, 500)

useEffect(() => {
  if (debouncedSearch) {
    searchBusinesses(debouncedSearch)
  }
}, [debouncedSearch])
```

---

## 🎯 QUICK WIN #8: Favicon y Metadata (15 min)

### Problema
Favicon por defecto de Next.js

### Solución
1. Generar favicon: https://favicon.io/
2. Colocar en `public/`
3. Actualizar metadata:

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'OnTurn - Sistema de Reservas',
    template: '%s | OnTurn'
  },
  description: 'Sistema inteligente de gestión de reservas para negocios',
  keywords: ['reservas', 'turnos', 'citas', 'appointments'],
  authors: [{ name: 'OnTurn Team' }],
  openGraph: {
    title: 'OnTurn - Sistema de Reservas',
    description: 'Sistema inteligente de gestión de reservas',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
}
```

---

## 🎯 QUICK WIN #9: Formato de Fechas Consistente (30 min)

### Problema
Fechas mostradas como ISO string

### Solución
```typescript
// lib/utils/dateFormat.ts
import { format, formatDistance, isPast } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = {
  short: (date: string | Date) => format(new Date(date), 'dd/MM/yyyy', { locale: es }),
  long: (date: string | Date) => format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: es }),
  time: (time: string) => time.slice(0, 5), // "10:30:00" -> "10:30"
  dateTime: (date: string | Date) => format(new Date(date), "dd/MM/yyyy 'a las' HH:mm", { locale: es }),
  relative: (date: string | Date) => formatDistance(new Date(date), new Date(), { 
    addSuffix: true, 
    locale: es 
  }),
}
```

**Uso:**
```typescript
// ANTES
{appointment.created_at}

// DESPUÉS
{formatDate.relative(appointment.created_at)} // "hace 2 días"
```

---

## 🎯 QUICK WIN #10: Environment Variables Validation (20 min)

### Problema
App rompe si falta una env var

### Solución
```typescript
// lib/config.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})
```

Falla en build time si falta alguna variable.

---

## 📊 IMPACTO ESTIMADO

| Quick Win | Tiempo | Impacto Usuario | Impacto Dev |
|-----------|--------|----------------|-------------|
| #1 Error Handling | 30 min | 🟢 Medio | 🟢 Alto |
| #2 Loading States | 45 min | 🟢 Alto | 🟢 Medio |
| #3 Empty States | 30 min | 🟢 Alto | 🟢 Bajo |
| #4 TypeScript Strict | 15 min | 🔵 Bajo | 🟢 Alto |
| #5 Confirmación | 45 min | 🟢 Alto | 🟢 Medio |
| #6 Image Optimization | 60 min | 🟢 Alto | 🟢 Alto |
| #7 Debounce | 20 min | 🟢 Medio | 🟢 Bajo |
| #8 Favicon/Meta | 15 min | 🟢 Medio | 🔵 Bajo |
| #9 Fechas | 30 min | 🟢 Alto | 🟢 Bajo |
| #10 Env Validation | 20 min | 🔵 Bajo | 🟢 Alto |

**Total:** ~4.5 horas  
**Impacto:** 🟢 Muy alto en UX y mantenibilidad

---

## 🎯 RECOMENDACIÓN

**Hacer en orden:**

1. ✅ #8 Favicon (15 min) - Primera impresión
2. ✅ #9 Fechas (30 min) - UX inmediato
3. ✅ #2 Loading States (45 min) - Percepción de velocidad
4. ✅ #3 Empty States (30 min) - Guía al usuario
5. ✅ #1 Error Handling (30 min) - Profesionalismo
6. ✅ #7 Debounce (20 min) - Performance
7. ✅ #6 Images (60 min) - Performance real
8. ✅ #10 Env Validation (20 min) - Prevenir bugs
9. ✅ #5 Confirmación (45 min) - UX elegante
10. ✅ #4 TypeScript (15 min) - Calidad código

**Total en 1 día de trabajo:** Proyecto se ve y se siente 10x mejor.

---

**Próximo paso después de Quick Wins: Ver [CHECKLIST.md](CHECKLIST.md) para tareas de mayor alcance.**
