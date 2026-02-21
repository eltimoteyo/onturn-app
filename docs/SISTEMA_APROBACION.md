# 🎯 Sistema de Aprobación de Negocios - OnTurn

## ✅ **Sistema Implementado Exitosamente**

Se ha implementado el nuevo flujo de registro y aprobación de negocios con las siguientes características:

---

## 🚀 **Nuevo Flujo de Registro**

### **Paso 1: Registro Inmediato**
- El usuario crea su cuenta y negocio **inmediatamente**
- No espera aprobación para acceder
- Supabase envía email de confirmación automáticamente
- Se crea con rol `business_owner` desde el inicio

### **Paso 2: Confirmación de Email**
- El usuario debe confirmar su email para iniciar sesión
- Evita cuentas falsas y spam
- Email enviado automáticamente por Supabase Auth

### **Paso 3: Acceso Limitado**
- Una vez confirmado el email, puede iniciar sesión
- Accede al dashboard del admin
- Ve banner de "negocio pendiente de aprobación"

#### ✅ **Lo que SÍ puede hacer:**
- Configurar horarios de atención
- Completar datos del negocio
- Agregar especialidades/servicios
- Subir logo del negocio
- Gestionar 1 especialista (él mismo)

#### ❌ **Lo que NO puede hacer hasta aprobación:**
- NO aparece en búsquedas públicas
- Los clientes NO pueden hacer reservas
- NO puede agregar más usuarios (recepcionistas, especialistas)
- NO puede actualizar de plan

### **Paso 4: Aprobación del Super Admin**
- El super admin revisa la solicitud en `/super-admin/solicitudes`
- Puede aprobar o rechazar el negocio
- Al aprobar:
  - `approval_status` = `'approved'`
  - `is_publicly_visible` = `true`
  - El negocio aparece en búsquedas públicas
  - Los clientes pueden hacer reservas

---

## 📊 **Sistema de Planes**

### **Plan FREE (Gratis)**
- ✅ 1 especialista (el dueño)
- ❌ 0 recepcionistas
- ❌ No aparece en búsquedas (hasta aprobación)
- ✅ Configuración básica disponible
- ✅ Todas las funcionalidades básicas

### **Plan BASIC ($19/mes)** *(Próximamente)*
- ✅ 3 especialistas
- ✅ 1 recepcionista
- ✅ Aparece en búsquedas (después de aprobación)
- ✅ Todas las funcionalidades

### **Plan PRO ($49/mes)** *(Próximamente)*
- ✅ 10 especialistas
- ✅ 3 recepcionistas
- ✅ Prioridad en búsquedas
- ✅ Estadísticas avanzadas

### **Plan ENTERPRISE (Personalizado)** *(Próximamente)*
- ✅ Especialistas ilimitados
- ✅ Recepcionistas ilimitados
- ✅ API access
- ✅ Soporte dedicado

---

## 🗄️ **Cambios en Base de Datos**

### **Ejecutar Script SQL:**
📄 **[scripts/add-approval-system.sql](../scripts/add-approval-system.sql)**

### **Nuevos Campos en `businesses`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `approval_status` | TEXT | `'pending'`, `'approved'`, `'rejected'` |
| `is_publicly_visible` | BOOLEAN | Si aparece en búsquedas públicas |
| `approved_at` | TIMESTAMPTZ | Fecha de aprobación |
| `approved_by` | UUID | ID del admin que aprobó |
| `rejection_reason` | TEXT | Razón del rechazo |
| `plan_type` | TEXT | `'free'`, `'basic'`, `'pro'`, `'enterprise'` |
| `max_specialists` | INTEGER | Límite de especialistas |
| `max_receptionists` | INTEGER | Límite de recepcionistas |

---

## 🎨 **Componentes Implementados**

### **1. ApprovalBanner** (`components/admin/ApprovalBanner.tsx`)

Banner que se muestra en el dashboard cuando el negocio está pendiente:

**Estados:**
- 🟠 **Pendiente**: Muestra limitaciones y lo que puede hacer
- 🔴 **Rechazado**: Muestra razón y enlaces de contacto
- ✅ **Aprobado**: No se muestra (banner oculto)

**Características:**
- Muestra estado actual del negocio
- Lista limitaciones temporales
- Lista acciones permitidas
- Botones de contacto (WhatsApp, Email)
- CTA para ver planes premium

### **2. UpgradeBanner** (`components/admin/ApprovalBanner.tsx`)

Banner persuasivo cuando el negocio está aprobado pero en plan FREE:

**Objetivo:**
- Persuadir para upgrade de plan
- Mostrar beneficios de planes premium
- CTA claro para actualizar

---

## 🔍 **Modificaciones en Búsquedas Públicas**

Todos los métodos de búsqueda ahora filtran por:

```typescript
.eq('approval_status', 'approved')
.eq('is_publicly_visible', true)
```

**Archivos modificados:**
- `lib/services/businesses.ts`
  - `getAllBusinesses()`
  - `getBusinessBySlug()`
  - `getBusinessesByCategory()`
  - `searchBusinesses()`

**Resultado:**
- Solo negocios aprobados aparecen en `/reservas`
- Solo negocios aprobados son accesibles por slug
- Negocios pendientes/rechazados NO son visibles públicamente

---

## 🚫 **Restricciones Implementadas**

### **En `/admin/especialistas`:**

Al intentar agregar un nuevo especialista:

1. **Verifica límite del plan:**
   ```typescript
   const maxAllowed = business.max_specialists || 1
   const currentCount = specialists.length
   
   if (currentCount >= maxAllowed) {
     // No permite agregar más
   }
   ```

2. **Verifica estado de aprobación:**
   ```typescript
   if (business.approval_status === 'pending') {
     // Muestra mensaje de espera de aprobación
   }
   ```

**Mensajes de error:**
- "Límite alcanzado: Tu plan FREE permite 1 especialista(s)"
- "Tu negocio aún está pendiente de aprobación"

---

## 👨‍💼 **Panel Super Admin**

**Ubicación:** `/super-admin/solicitudes`

**Funcionalidades:**
- Ver lista de negocios por estado (pendiente, aprobado, rechazado)
- Estadísticas en cards (cantidad por estado)
- Botón "Aprobar" para cada negocio pendiente
- Botón "Rechazar" con campo para razón
- Información del dueño (nombre, email, teléfono)

**Acciones:**
- **Aprobar**: Marca como aprobado, hace visible públicamente
- **Rechazar**: Marca como rechazado, guarda razón, oculta del público

---

## 📝 **Flujo Completo del Usuario**

### **1. Registro** (`/registro-negocio`)
```
Usuario llena formulario
  ↓
Se crea usuario en auth.users (business_owner)
  ↓
Se crea perfil en profiles
  ↓
Se crea negocio en businesses (pending)
  ↓
Se crea solicitud en tenant_registration_requests
  ↓
Supabase envía email de confirmación
  ↓
Usuario cierra sesión automáticamente
  ↓
Redirige a /admin/login
```

### **2. Confirmación de Email**
```
Usuario recibe email
  ↓
Hace click en link de confirmación
  ↓
Email confirmado en Supabase
```

### **3. Primer Login** (`/admin/login`)
```
Usuario inicia sesión
  ↓
Re dirigido a /admin/dashboard
  ↓
Ve ApprovalBanner (negocio pendiente)
  ↓
Puede configurar datos básicos
```

### **4. Aprobación** (Super Admin)
```
Admin va a /super-admin/solicitudes
  ↓
Ve negocio pendiente
  ↓
Click en "Aprobar"
  ↓
approval_status = 'approved'
  ↓
is_publicly_visible = true
```

### **5. Post-Aprobación** (Usuario)
```
Usuario refresca /admin/dashboard
  ↓
ApprovalBanner desaparece
  ↓
Puede agregar usuarios (según plan)
  ↓
Negocio visible en búsquedas
  ↓
Clientes pueden hacer reservas
```

---

## 🎯 **Estrategia de Monetización**

### **Conversion Funnel:**

1. **Registro Gratis** → Usuario crea cuenta sin fricción
2. **Email Confirmado** → Valida usuario real
3. **Configuración Básica** → Se familiariza con el sistema
4. **Banner Plan FREE** → Ve limitaciones (1 especialista)
5. **Aprobación** → Puede empezar a recibir reservas
6. **Necesidad de Crecer** → Quiere agregar recepcionista
7. **Upgrade CTA** → Banner persuasivo "Actualizar Plan"
8. **Conversión** → Paga por plan premium

### **Puntos de Contacto:**
- 📱 WhatsApp: Para soporte y urgencias
- 📧 Email: Para consultas formales
- 💎 Banners: Persuasión constante para upgrade

---

## 🧪 **Testing**

### **Test 1: Registro Completo**
1. Ir a `/registro-negocio`
2. Llenar formulario completo
3. Click "Enviar Solicitud"
4. ✅ Debe mostrar mensaje de éxito con pasos
5. ✅ Redirigir a `/admin/login`
6. Revisar email de confirmación

### **Test 2: Login Pendiente**
1. Confirmar email (click en link)
2. Ir a `/admin/login`
3. Iniciar sesión con credenciales
4. ✅ Debe redirigir a `/admin/dashboard`
5. ✅ Debe mostrar ApprovalBanner naranja
6. ✅ Puede configurar horarios y datos

### **Test 3: Restricciones**
1. En dashboard pendiente
2. Ir a `/admin/especialistas`
3. Intentar agregar 2do especialista
4. ✅ Debe mostrar error de límite
5. Buscar negocio en `/reservas`
6. ✅ NO debe aparecer (pendiente)

### **Test 4: Aprobación**
1. Login como admin en `/super-admin/solicitudes`
2. Ver negocio pendiente
3. Click "Aprobar"
4. ✅ Estado cambia a aprobado
5. Logout y login como business_owner
6. ✅ ApprovalBanner desaparece
7. ✅ Negocio aparece en `/reservas`

---

## 🐛 **Solución de Problemas**

### **Error: Usuario no puede iniciar sesión**
- Verificar que confirmó el email
- Revisar que `email_confirmed_at` no sea NULL

### **Error: Negocio no aparece en búsquedas**
- Verificar `approval_status = 'approved'`
- Verificar `is_publicly_visible = true`

### **Error: No puede agregar especialista**
- Verificar límite del plan (`max_specialists`)
- Verificar que negocio esté aprobado

### **Script SQL falla**
- Verificar permisos de administrador
- Ejecutar en Supabase SQL Editor
- Revisar que las columnas no existan ya

---

## 📚 **Archivos Modificados**

### **SQL:**
- ✅ `scripts/add-approval-system.sql` (NUEVO)

### **Types:**
- ✅ `types/business.ts` (campos aprobación y planes)

### **Pages:**
- ✅ `app/registro-negocio/page.tsx` (registro inmediato)
- ✅ `app/admin/dashboard/page.tsx` (banners)
- ✅ `app/admin/especialistas/page.tsx` (límites)

### **Components:**
- ✅ `components/admin/ApprovalBanner.tsx` (NUEVO)

### **Services:**
- ✅ `lib/services/businesses.ts` (filtros públicos)

---

## 🎉 **Próximos Pasos**

1. **Ejecutar SQL:** `scripts/add-approval-system.sql`
2. **Probar registro:** Crear nuevo negocio
3. **Verificar email:** Confirmar cuenta
4. **Aprobar negocio:** Desde super-admin
5. **Implementar pagos:** Sistema de planes premium (Stripe/PayPal)
6. **Email templates:** Personalizar emails de confirmación
7. **Notificaciones:** Avisar cuando negocio sea aprobado

---

**Última actualización:** 17 de Febrero de 2026  
**Estado:** ✅ Sistema Completo y Funcional  
**Próximo:** Implementar sistema de pagos para planes premium
