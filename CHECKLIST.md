# ✅ Checklist de Tareas - OnTurn

> **Checklist actualizado:** 18 de febrero de 2026  
> **Usar este documento para tracking diario**

---

## 🚨 CRÍTICO - Hacer Esta Semana

### Bugs y Correcciones
- [x] Fix: Políticas RLS para aprobación de negocios (businesses UPDATE)
- [ ] Verificar que todas las políticas RLS de super admin funcionan
- [ ] Probar flujo completo de aprobación end-to-end

### UX y Consistencia
- [ ] **Reemplazar TODOS los `alert()` por Toast notifications**
  - [ ] app/registro-negocio/page.tsx
  - [ ] app/registro/page.tsx
  - [ ] app/admin/especialidades/page.tsx
  - [ ] app/admin/especialistas/page.tsx
  - [ ] app/admin/usuarios/page.tsx
  - [ ] app/super-admin/solicitudes/page.tsx
  - [ ] app/super-admin/tenants/[id]/page.tsx

- [ ] **Agregar validación Zod a formularios sin validar**
  - [ ] Perfil de usuario
  - [ ] Configuración de negocio (horarios)
  - [ ] Crear especialidad
  - [ ] Crear especialista

### Estabilidad
- [ ] **Instalar y configurar error boundaries**
  ```bash
  npm install react-error-boundary
  ```
  - [ ] Agregar ErrorBoundary en app/layout.tsx
  - [ ] Agregar ErrorBoundary en app/admin/layout.tsx
  - [ ] Crear componente de error bonito

---

## ⚡ ALTA PRIORIDAD - Próximas 2 Semanas

### Testing (FUNDAMENTAL para escalar)
- [ ] **Setup de testing**
  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
  ```
  - [ ] Crear jest.config.js
  - [ ] Crear setup de tests
  - [ ] Escribir test para useAuth hook
  - [ ] Escribir tests para servicios (businesses, appointments)
  - [ ] Escribir tests para componentes (Button, Card, Toast)

### Funcionalidades Core
- [ ] **Página de perfil de usuario**
  - [ ] app/perfil/page.tsx completo
  - [ ] Editar nombre, teléfono, email
  - [ ] Cambiar avatar (con ImageUpload)
  - [ ] Cambiar contraseña
  - [ ] Preferencias de notificaciones

- [ ] **Paginación en listas**
  - [ ] Lista de establecimientos (app/reservas/page.tsx)
  - [ ] Lista de reservas admin (app/admin/reservas/page.tsx)
  - [ ] Crear componente Pagination.tsx reutilizable

### Optimización
- [ ] **Migrar todas las <img> a <Image> de Next.js**
  - [ ] Componentes en app/reservas
  - [ ] Componentes en app/admin
  - [ ] Landing page
  
- [ ] **Debounce en búsquedas**
  - [ ] Instalar `use-debounce`
  - [ ] Aplicar en app/reservas/page.tsx
  - [ ] Aplicar en app/super-admin/tenants/page.tsx

---

## 🎯 MEDIO PLAZO - Semanas 3-6

### Panel de Negocio
- [ ] **Calendario visual de reservas**
  - [ ] Instalar react-big-calendar o similar
  - [ ] Integrar en app/admin/reservas/page.tsx
  - [ ] Vista día/semana/mes
  - [ ] Drag & drop para reprogramar

- [ ] **Gestión de disponibilidad**
  - [ ] Tabla `specialist_availability` en DB
  - [ ] Página app/admin/disponibilidad/page.tsx
  - [ ] Bloquear horarios específicos
  - [ ] Marcar días festivos

- [ ] **Reportes básicos**
  - [ ] Instalar recharts
  - [ ] Dashboard con gráficas
  - [ ] Exportar a CSV

### Panel de Cliente
- [ ] **Sistema de calificaciones**
  - [ ] Tabla `reviews` en DB
  - [ ] Dejar reseña después de servicio
  - [ ] Mostrar reseñas en detalle de negocio
  - [ ] Promedio de estrellas

- [ ] **Filtros avanzados**
  - [ ] Por calificación
  - [ ] Por disponibilidad
  - [ ] Por ubicación (si hay coords)

- [ ] **Favoritos**
  - [ ] Tabla `user_favorites` en DB
  - [ ] Marcar/desmarcar favorito
  - [ ] Página de favoritos

### Super Admin
- [ ] **Dashboard con métricas**
  - [ ] Gráficas con recharts
  - [ ] Total negocios/usuarios/reservas
  - [ ] KPIs importantes

- [ ] **Gestión de categorías**
  - [ ] CRUD de categorías
  - [ ] app/super-admin/categorias/page.tsx

---

## 🚀 ARQUITECTURA API - Semanas 7-10

### Fase 1: Setup
- [ ] **Crear estructura de API**
  - [ ] app/api/auth/login/route.ts
  - [ ] app/api/auth/register/route.ts
  - [ ] app/api/businesses/route.ts
  - [ ] app/api/appointments/route.ts

- [ ] **Crear lib/api/client.ts**
  ```typescript
  // Wrapper de fetch con auth automático
  export const api = {
    get: (url: string) => fetch(url, { headers: ... }),
    post: (url: string, data: any) => fetch(url, { method: 'POST', ... }),
    // ...
  }
  ```

### Fase 2: Migración
- [ ] **Migrar servicios uno por uno**
  - [ ] Autenticación
  - [ ] Businesses
  - [ ] Appointments
  - [ ] Specialists

- [ ] **Actualizar componentes**
  - [ ] Reemplazar llamadas directas a Supabase por llamadas a API
  - [ ] Mantener Supabase como fallback

### Fase 3: Testing
- [ ] **Tests de API Routes**
  - [ ] Tests de integración para cada endpoint
  - [ ] Tests de autenticación
  - [ ] Tests de errores

---

## ✨ FUNCIONALIDADES AVANZADAS - Semanas 11+

### PWA
- [ ] Crear manifest.json
- [ ] Configurar service worker
- [ ] Probar instalación en móvil
- [ ] Notificaciones push reales

### SEO
- [ ] Schema.org en todas las páginas
- [ ] Sitemap.xml dinámico
- [ ] Meta tags completos
- [ ] robots.txt

### i18n
- [ ] Instalar next-intl
- [ ] Traducir UI a inglés
- [ ] Toggle de idioma

### Modo Oscuro
- [ ] Configurar Tailwind dark mode
- [ ] Toggle en header
- [ ] Persistir preferencia

---

## 🛠️ SCRIPTS ÚTILES

### Instalar dependencias de testing
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Instalar dependencias de UI
```bash
npm install react-error-boundary use-debounce react-big-calendar recharts
```

### Instalar dependencias de i18n
```bash
npm install next-intl
```

### Ejecutar tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Construir para producción
```bash
npm run build
npm start
```

---

## 📊 PROGRESO ACTUAL

**Total de tareas:** ~100  
**Completadas:** ~65  
**Progreso:** 65%

**Prioridad crítica:** 7 tareas  
**Prioridad alta:** 15 tareas  
**Prioridad media:** 30 tareas

---

## 🎯 OBJETIVO SEMANAL

### Semana 1 (Esta semana)
- Completar todas las tareas CRÍTICAS
- Meta: 80% del código sin `alert()`
- Meta: Error boundaries funcionando

### Semana 2
- Completar setup de testing
- Completar página de perfil
- Meta: 10+ tests escritos

### Semana 3-4
- Paginación en todas las listas
- Debounce en búsquedas
- Meta: Lighthouse score > 70

### Semana 5-6
- Calendario de reservas funcional
- Sistema de reseñas básico
- Meta: MVP al 90%

---

**Actualizar este checklist semanalmente**
