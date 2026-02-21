# 📋 Plan de Completación - OnTurn

> **Fecha de Análisis:** 18 de febrero de 2026  
> **Estado Actual:** MVP funcional al ~65%, arquitectura base sólida  
> **Objetivo:** Producto completo, escalable y listo para migración a API propia

---

## 🔍 ANÁLISIS PROFUNDO DEL PROYECTO

### ✅ Fortalezas Actuales

#### 1. **Arquitectura Moderna y Sólida**
- ✅ Next.js 16 con App Router (última versión, SSR +client components)
- ✅ TypeScript strict mode (type safety completo)
- ✅ Supabase con RLS (seguridad a nivel de base de datos)
- ✅ Estructura de carpetas clara y escalable
- ✅ Separación de concerns (services, components, types, hooks)

#### 2. **Sistema de Autenticación Robusto**
- ✅ Multi-rol completo (customer, business_owner, admin, specialist, receptionist)
- ✅ Middleware de protección de rutas
- ✅ Hook useAuth centralizado
- ✅ Flujo de registro con aprobación para negocios
- ✅ Trigger automático de creación de perfiles

#### 3. **Base de Datos Bien Diseñada**
- ✅ 11 tablas con relaciones bien definidas
- ✅ Row Level Security (RLS) implementado
- ✅ Índices de rendimiento creados
- ✅ Soft delete en algunas entidades
- ✅ Auditoría con created_at/updated_at automáticos
- ✅ Multi-tenant con aislamiento por business_id

#### 4. **Componentes UI Reutilizables**
- ✅ Sistema de diseño consistente
- ✅ 11 componentes UI base (Button, Card, Input, Badge, etc.)
- ✅ Toast notifications (reemplaza alerts)
- ✅ Skeleton loaders para estados de carga
- ✅ Dialog/Modal system

#### 5.  **Servicios de Negocio Implementados**
- ✅ businesses.ts - CRUD de establecimientos
- ✅ specialists.ts - Gestión de especialistas (CRUD + soft delete)
- ✅ appointments.ts - CRUD de reservas
- ✅ admin.ts - Servicios para panel admin
- ✅ storage.ts - Upload con compresión a WebP
- ✅ specialties.ts - Gestión de especialidades
- ✅ profile.ts - Gestión de perfiles

#### 6. **Funcionalidades Críticas Funcionando**
- ✅ Sistema de registro con aprobación
- ✅ Dashboard de negocio con métricas
- ✅ Gestión de especialistas y especialidades
- ✅ Configuración de horarios de atención
- ✅ Upload de imágenes con compresión (60-80% reducción)
- ✅ Widget de próximos turnos en header

---

### 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

#### 1. **⚠️ Falta de Capa de API Intermedia** (ALTO IMPACTO)
**Problema:** Todo el código del cliente llama directamente a Supabase
- ❌ No hay validación centralizada de negocio
- ❌ Lógica de negocio duplicada en múltiples páginas
- ❌ Dificulta futuras migraciones (Firebase, API propia, etc.)
- ❌ No hay rate limiting ni control de peticiones
- ❌ Dificulta testing unitario

**Impacto en escalabilidad:** 🔴 CRÍTICO  
**Dificultad de migración futura:** 🔴 ALTA (reescribir ~70% del código cliente)

#### 2. **⚠️ Políticas RLS Incompletas** (ALTO IMPACTO - YA ENCONTRADO)
**Problema:** Falta política de UPDATE para super admins en businesses
- ❌ El flujo de aprobación no funciona correctamente
- ❌ Otras políticas pueden tener agujeros similares
- ❌ No están documentadas las políticas existentes

**Estado actual:** En proceso de corrección

#### 3. **⚠️ Sin Validación de Negocio Centralizada** (MEDIO IMPACTO)
**Problema:** Validación Zod solo en algunos formularios
- ❌ Muchos formularios usan validación manual inconsistente
- ❌ No hay validación server-side (solo client-side)
- ❌ Mensajes de error inconsistentes (alert vs toast)

#### 4. **⚠️ Sin Sistema de Gestión de Estado Global** (MEDIO IMPACTO)
**Problema:** Cada componente maneja su propio estado
- ❌ Props drilling excesivo
- ❌ Recarga innecesaria de datos
- ❌ No hay caché de datos
- ❌ Dificulta implementar funciones offline

#### 5. **⚠️ Falta Manejo de Errores Robusto** (MEDIO IMPACTO)
**Problema:** Muchos console.error y alerts genéricos
- ❌ No hay error boundaries en React
- ❌ No hay logging estructurado
- ❌ No hay tracking de errores (Sentry, etc.)
- ❌ Experiencia de usuario pobre en errores

#### 6. **⚠️ Sin Tests** (ALTO IMPACTO A LARGO PLAZO)
**Problema:** Cero cobertura de testing
- ❌ No hay tests unitarios
- ❌ No hay tests de integración
- ❌ No hay tests E2E
- ❌ Refactoring es peligroso

#### 7. **⚠️ Sin Optimización de Performance** (MEDIO IMPACTO)
**Problema:** Muchas cargas innecesarias
- ❌ No hay paginación en listas largas
- ❌ No hay debounce en búsquedas
- ❌ Imágenes sin optimización de Next.js (next/image)
- ❌ No hay lazy loading de componentes

---

### 📊 FUNCIONALIDADES FALTANTES

#### Panel de Usuario (Cliente)
- [ ] **Filtros avanzados** en lista de establecimientos
  - Por rango de precio
  - Por calificación
  - Por disponibilidad inmediata
  - Por ubicación/distancia
- [ ] **Sistema de calificaciones y reseñas**
  - Dejar reseña después de completar servicio
  - Ver reseñas de otros usuarios
  - Promedio de calificaciones
- [ ] **Perfil de usuario editable**
  - Cambiar nombre, teléfono, avatar
  - Cambiar contraseña
  - Preferencias de notificaciones
- [ ] **Sistema de favoritos**
  - Guardar establecimientos favoritos
  - Acceso rápido a favoritos
- [ ] **Historial completo**
  - Exportar historial a PDF
  - Estadísticas personales
- [ ] **Notificaciones push**
  - Recordatorio 24h antes
  - Confirmación de reserva
  - Cambios en reserva

#### Panel de Negocio (Business Owner)
- [ ] **Gestión de múltiples establecimientos**
  - Crear nuevo establecimiento
  - Editar establecimientos existentes
  - Activar/desactivar establecimientos
- [ ] **Calendario visual de reservas**
  - Vista diario/semanal/mensual
  - Drag & drop para reprogramar
  - Código de colores por estado
- [ ] **Gestión de disponibilidad avanzada**
  - Bloqueos de horarios
  - Días festivos
  - Vacaciones por especialista
  - Eventos especiales
- [ ] **Reportes y analíticas**
  - Ingresos estimados
  - Ocupación promedio
  - Especialistas más solicitados
  - Clientes frecuentes
  - Exportar a Excel/PDF
- [ ] **Sistema de lista de espera**
  - Cuando no hay horarios disponibles
  - Notificar automáticamente si hay cancelación
- [ ] **Gestión de recetas y archivos**
  - Subir documentos por reserva
  - Template de recetas
  - Firma digital
- [ ] **Configuración de precios**
  - Precios por especialidad
  - Descuentos
  - Paquetes/promociones

#### Panel Super Admin
- [ ] **Dashboard con métricas globales**
  - Total de negocios activos
  - Total de usuarios
  - Reservas del día/semana/mes
  - Gráficas de crecimiento
- [ ] **Configuración de categorías**
  - CRUD de categorías
  - Iconos personalizados
  - Orden de visualización
- [ ] **Log de actividades**
  - Quién aprobó qué y cuándo
  - Cambios importantes
  - Accesos sospechosos
- [ ] **Gestión de límites por tenant**
  - Max usuarios
  - Max especialistas
  - Max reservas/mes
  - Features habilitadas
- [ ] **Sistema de planes/precios** (futuro)
  - Plan Free, Pro, Enterprise
  - Límites por plan
  - Pagos integrados

#### Funcionalidades Transversales
- [ ] **PWA (Progressive Web App)**
  - Manifest.json
  - Service Worker
  - Funcionar offline (lectura)
  - Instalable en móvil
- [ ] **SEO Avanzado**
  - Schema.org markup completo
  - Sitemap dinámico
  - robots.txt optimizado
  - Meta tags Open Graph
- [ ] **Internacionalización (i18n)**
  - Soporte multi-idioma
  - Español/Inglés inicial
- [ ] **Modo oscuro**
  - Theme toggle
  - Persistencia de preferencia
- [ ] **Exportación de datos**
  - GDPR compliance
  - Descarga de datos personales
  - Borrado de cuenta

---

## 🏗️ ARQUITECTURA PROPUESTA PARA ESCALABILIDAD

### Migración a Arquitectura API-First (Preparación futura)

#### Estructura Propuesta

```
onturn-app/
├── app/                      # Next.js App Router (Frontend)
│   ├── (rutas existentes)
│   └── api/                  # API Routes (capa intermedia)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── logout/route.ts
│       ├── businesses/
│       │   ├── route.ts           # GET /api/businesses
│       │   ├── [id]/route.ts      # GET/PUT/DELETE /api/businesses/:id
│       │   └── [id]/appointments/route.ts
│       ├── appointments/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── specialists/
│       ├── specialties/
│       └── admin/
│
├── lib/
│   ├── api/                  # Cliente API (reemplaza servicios directos)
│   │   ├── client.ts         # Axios/Fetch configurado
│   │   ├── businesses.ts     # async function getBusinesses() { return api.get('/businesses') }
│   │   ├── appointments.ts
│   │   └── auth.ts
│   │
│   ├── server/               # Lógica de negocio server-side
│   │   ├── repositories/     # Acceso a datos (Supabase, DB, etc.)
│   │   │   ├── business.repository.ts
│   │   │   ├── appointment.repository.ts
│   │   │   └── user.repository.ts
│   │   │
│   │   ├── services/         # Lógica de negocio
│   │   │   ├── business.service.ts
│   │   │   ├── appointment.service.ts
│   │   │   └── notification.service.ts
│   │   │
│   │   └── validators/       # Validación centralizada
│   │       ├── business.validator.ts
│   │       └── appointment.validator.ts
│   │
│   ├── supabase/            # Mantener para compatibilidad
│   └── utils/
│
├── middleware/
│   ├── auth.middleware.ts
│   ├── rateLimit.middleware.ts
│   └── errorHandler.middleware.ts
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

#### Ventajas de Esta Arquitectura

1. **Migración Gradual**
   - Puedes migrar ruta por ruta sin romper nada
   - Supabase sigue funcionando mientras migras
   - No hay "big bang" rewrite

2. **Abstracción de Base de Datos**
   ```typescript
   // ANTES (acoplado a Supabase)
   const { data } = await supabase.from('businesses').select('*')
   
   // DESPUÉS (desacoplado)
   const businesses = await api.get('/businesses')
   
   // Server-side puede cambiar de Supabase a Postgres, MongoDB, etc.
   ```

3. **Validación Centralizada**
   ```typescript
   // API Route
   export async function POST(req: Request) {
     const body = await req.json()
     const validated = BusinessSchema.parse(body) // Zod
     const result = await BusinessService.create(validated)
     return Response.json(result)
   }
   ```

4. **Testing Fácil**
   ```typescript
   // Mockear API es trivial
   jest.mock('@/lib/api/businesses')
   ```

5. **Rate Limiting y Seguridad**
   ```typescript
   // middleware/rateLimit.ts
   export function rateLimit() {
     // Implementar rate limiting por usuario/IP
   }
   ```

---

## 📝 PLAN DE IMPLEMENTACIÓN PRIORIZADO

### 🎯 FASE 1: Estabilización y Corrección (1-2 semanas)
**Objetivo:** Arreglar bugs críticos y completar funcionalidades a medias

#### Prioridad CRÍTICA (Hacer primero)
- [x] ~~Fix: Políticas RLS para aprobación de negocios~~ (EN PROGRESO)
- [ ] **Fix global: Reemplazar todos los `alert()` por Toast**
- [ ] **Fix: Validación de formularios con Zod en TODOS los formularios**
- [ ] **Fix: Manejo de errores con Error Boundaries**
- [ ] **Documentar: Guía de políticas RLS existentes**
- [ ] **Testing: Crear suite básica de tests (Jest + RTL)**
  - Tests unitarios para servicios
  - Tests de hooks (useAuth)
  - Tests de componentes críticos

#### Prioridad ALTA
- [ ] **Página de perfil de usuario completa**
  - Editar nombre, teléfono, avatar
  - Cambiar contraseña
  - Preferencias
- [ ] **Paginación en todas las listas**
  - Lista de establecimientos
  - Lista de reservas
  - Listas en admin
- [ ] **Optimización de imágenes**
  - Migrar a `next/image` en TODO el proyecto
  - Lazy loading de componentes pesados
- [ ] **Debounce en búsquedas**
- [ ] **Loading states consistentes**
  - Skeleton en TODAS las cargas
  - Estados de "sin datos"

---

### 🎯 FASE 2: Funcionalidades Core Faltantes (2-3 semanas)
**Objetivo:** Completar MVP funcional al 100%

#### Panel de Negocio
- [ ] **Calendario visual de reservas**
  - Usar librería (react-big-calendar o similar)
  - Vista día/semana/mes
  - Drag & drop para reprogramar
- [ ] **Gestión de disponibilidad avanzada**
  - Bloqueos de horarios
  - Días festivos
  - Vacaciones
- [ ] **Reportes básicos**
  - Reservas por día/semana/mes
  - Especialistas más solicitados
  - Exportar a CSV

#### Panel de Cliente
- [ ] **Sistema de calificaciones y reseñas**
  - Dejar reseña (stars + comentario)
  - Ver reseñas en detalle de negocio
  - Promedio de estrellas
- [ ] **Filtros avanzados**
  - Por calificación
  - Por distancia (si hay coords)
  - Por disponibilidad
- [ ] **Favoritos**
  - Marcar/desmarcar
  - Página de favoritos

#### Super Admin
- [ ] **Dashboard con métricas reales**
  - Gráficas con recharts o similar
  - KPIs importantes
- [ ] **Gestión de categorías (CRUD)**
- [ ] **Log de actividades**

---

### 🎯 FASE 3: Preparación para Escalabilidad (3-4 semanas)
**Objetivo:** Migrar a arquitectura API-First progresivamente

#### Paso 1: Crear Capa de API Routes
- [ ] **Setup de API Routes en `/app/api`**
  - Estructura de carpetas
  - Middleware de autenticación
  - Middleware de manejo de errores
  - Rate limiting básico

#### Paso 2: Migrar Servicios Críticos
- [ ] **Migrar servicio de autenticación**
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/logout
  - GET /api/auth/me
  
- [ ] **Migrar servicio de businesses**
  - GET /api/businesses
  - GET /api/businesses/:id
  - PUT /api/businesses/:id (admin)
  - POST /api/businesses (admin)

- [ ] **Migrar servicio de appointments**
  - GET /api/appointments (filtrado por user)
  - POST /api/appointments (crear reserva)
  - PUT /api/appointments/:id (cancelar, confirmar)

#### Paso 3: Actualizar Cliente
- [ ] **Crear `lib/api/client.ts`** (Axios/Fetch wrapper)
- [ ] **Migrar componentes a usar API routes**
  - Migrar página por página
  - Mantener Supabase como fallback temporal

#### Paso 4: Testing de API
- [ ] **Tests de integración para API routes**
- [ ] **Tests E2E con Playwright o Cypress**

---

### 🎯 FASE 4: Funcionalidades Avanzadas (2-3 semanas)
**Objetivo:** Product-market fit completo

- [ ] **PWA**
  - Manifest.json
  - Service Worker
  - Instalable
  - Notificaciones push reales
  
- [ ] **SEO Avanzado**
  - Schema.org para cada tipo de página
  - Sitemap dinámico
  - Meta tags completos
  
- [ ] **Sistema de notificaciones completo**
  - Email (SendGrid/Resend)
  - SMS (Twilio) - opcional
  - Push notifications
  - Centro de notificaciones in-app
  
- [ ] **Modo oscuro**
  - Toggle en header
  - Persistencia
  
- [ ] **i18n (español/inglés)**
  - next-intl o similar
  - Detección automática

---

### 🎯 FASE 5: Optimización y Pulido (1-2 semanas)
**Objetivo:** Producto production-ready

- [ ] **Performance**
  - Lighthouse score > 90
  - Code splitting agresivo
  - Optimización de bundles
  - CDN para assets estáticos
  
- [ ] **Monitoreo**
  - Sentry para errores
  - Analytics (GA4 o similar)
  - Logging estructurado (Winston/Pino)
  
- [ ] **Seguridad**
  - Audit de dependencias
  - OWASP top 10 checklist
  - Penetration testing básico
  
- [ ] **Documentación**
  - README completo
  - Guía de contribución
  - Documentación de API
  - Diagramas de arquitectura

---

### 🎯 FASE 6: Preparación para Monetización (Opcional)
**Objetivo:** Sistema de planes y pagos

- [ ] **Sistema de planes**
  - Free, Pro, Enterprise
  - Límites por plan
  - Feature flags
  
- [ ] **Integración de pagos**
  - Stripe o similar
  - Suscripciones recurrentes
  - Webhooks
  
- [ ] **Facturación**
  - Generar facturas
  - Historial de pagos
  - Descargar comprobantes

---

## 📊 ESTIMACIÓN DE TIEMPO TOTAL

| Fase | Duración | Complejidad | Prioridad |
|------|----------|-------------|-----------|
| Fase 1: Estabilización | 1-2 semanas | Media | 🔴 CRÍTICA |
| Fase 2: Funcionalidades Core | 2-3 semanas | Media-Alta | 🔴 ALTA |
| Fase 3: Arquitectura API | 3-4 semanas | Alta | 🟡 MEDIA |
| Fase 4: Funcionalidades Avanzadas | 2-3 semanas | Media | 🟢 BAJA |
| Fase 5: Optimización | 1-2 semanas | Media | 🟢 BAJA |
| Fase 6: Monetización | 2-3 semanas | Alta | 🟢 OPCIONAL |

**Total estimado:** 11-17 semanas (~3-4 meses) para tener un producto completo y escalable.

**Total MVP mejorado (Fases 1-2):** 3-5 semanas para tener funcionalidades core completas.

---

## 🎯 ROADMAP VISUAL

```
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO ACTUAL (Semana 0)                  │
│                     MVP al ~65%                              │
│  ✅ Auth  ✅ Dashboard  ✅ Especialistas  ⚠️ Aprobaciones  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FASE 1: Estabilización (Semanas 1-2)           │
│  🎯 Objetivo: Bug-free y UX consistente                     │
│  ✅ RLS completo  ✅ Validaciones  ✅ Error handling        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         FASE 2: Funcionalidades Core (Semanas 3-5)          │
│  🎯 Objetivo: MVP funcional 100%                            │
│  ✅ Calendario  ✅ Reviews  ✅ Reportes  ✅ Perfil         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────┴────────────────────────┐
    │                                                 │
    ▼                                                 ▼
┌─────────────────────────┐           ┌──────────────────────────┐
│  RUTA A: Lanzamiento    │           │  RUTA B: Escalabilidad   │
│  MVP Mejorado           │           │  Arquitectura API        │
│  (3-5 semanas)          │           │  (8-12 semanas)          │
│                         │           │                          │
│  Supabase directo       │           │  FASE 3: API Routes      │
│  Bueno para validar     │           │  FASE 4: Features ++     │
│  Escala hasta ~1000     │           │  FASE 5: Optimización    │
│  usuarios               │           │                          │
└─────────────────────────┘           │  Migración fácil a       │
                                      │  cualquier backend       │
                                      │  Escala +infinito        │
                                      └──────────────────────────┘
```

---

## 🚀 RECOMENDACIÓN ESTRATÉGICA

### Si tu objetivo es **validar el producto rápido** (3-6 meses):
→ **Seguir Fases 1-2 + lanzar**
- Mantener Supabase directo
- Enfocarse en funcionalidades de usuario
- Iterar rápido con feedback

### Si tu objetivo es **construir un SaaS escalable** (6-12 meses):
→ **Ejecutar Fases 1-5 completas**
- Migrar a arquitectura API-First
- Testing robusto
- Preparado para cambiar backend sin romper nada

---

## 📋 PRÓXIMOS PASOS INMEDIATOS

### Esta Semana (Semana 1)
1. ✅ Completar fix de políticas RLS de aprobación
2. [ ] Configurar Jest y React Testing Library
3. [ ] Escribir tests para `useAuth` hook
4. [ ] Reemplazar `alert()` por Toast en top 5 páginas más usadas
5. [ ] Agregar Error Boundary en layout principal

### Próxima Semana (Semana 2)
1. [ ] Completar validación Zod en todos los formularios
2. [ ] Implementar paginación en lista de establecimientos
3. [ ] Migrar todas las imágenes a `next/image`
4. [ ] Crear página de perfil de usuario completa
5. [ ] Documentar políticas RLS existentes

---

## 🎓 RECURSOS RECOMENDADOS

### Testing
- Jest + React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Playwright (E2E): https://playwright.dev/

### API Routes
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Zod validation: https://zod.dev/

### Escalabilidad
- Next.js Performance: https://nextjs.org/docs/app/building-your-application/optimizing
- React Query (data fetching): https://tanstack.com/query/latest

---

**Autor:** GitHub Copilot  
**Última actualización:** 18 de febrero de 2026
