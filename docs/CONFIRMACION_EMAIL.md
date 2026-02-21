# Sistema de Confirmación de Email

## 📋 Flujo Completo

### 1. **Usuario se registra** → `/registro-negocio`
- Llena el formulario con datos personales y del negocio
- Hace clic en "Registrar Establecimiento"

### 2. **Backend procesa el registro**
```typescript
// ✅ Se crea usuario en auth.users
supabase.auth.signUp({email, password})

// ✅ Se guardan datos en pending_registrations
INSERT INTO pending_registrations (
  user_id, email, full_name, role,
  business_name, business_description, etc...
)

// ❌ NO se crea perfil todavía
// ❌ NO se crea negocio todavía

// ✅ Auto logout
supabase.auth.signOut()
```

### 3. **Usuario recibe email de Supabase**
- Asunto: "Confirm your signup"
- Contiene link de confirmación

### 4. **Usuario hace clic en el link**
- Supabase actualiza `auth.users.email_confirmed_at`
- **TRIGGER automático se dispara** → `handle_email_confirmed()`

### 5. **Trigger crea todo automáticamente**
```sql
-- ✅ Crear perfil
INSERT INTO profiles (id, full_name, role)
VALUES (user_id, 'Juan Pérez', 'business_owner')

-- ✅ Crear negocio con slug único
INSERT INTO businesses (
  owner_id, name, slug,
  approval_status = 'pending',
  plan_type = 'free',
  max_specialists = 1
)

-- ✅ Crear solicitud para admin
INSERT INTO tenant_registration_requests (...)

-- ✅ Marcar como procesado
UPDATE pending_registrations SET processed = true
```

### 6. **Usuario es redirigido** → `/admin/dashboard`
- Ya tiene perfil creado
- Ya tiene negocio creado (estado: pending)
- Puede empezar a configurar

---

## 🔧 Scripts SQL a Ejecutar

### **Script 1: Sistema de Aprobación**
```bash
scripts/add-approval-system.sql
```
Agrega columnas: `approval_status`, `plan_type`, `max_specialists`, etc.

### **Script 2: Sistema de Confirmación de Email**
```bash
scripts/fix-email-confirmation-flow.sql
```
Crea:
- Tabla `pending_registrations`
- Función `handle_email_confirmed()`
- Trigger `on_email_confirmed`

---

## ✅ Ventajas de este Flujo

1. **No hay perfiles fantasma**
   - Solo se crean perfiles de usuarios que confirmaron su email
   
2. **No hay race conditions**
   - El trigger se ejecuta DESPUÉS de confirmar email
   - Cuando el usuario hace login, el perfil ya existe

3. **Experiencia clara**
   - Usuario sabe que debe confirmar email primero
   - Todo se crea automáticamente al confirmar

4. **Seguridad**
   - Evita spam con emails falsos
   - Solo usuarios reales acceden al sistema

---

## 🧪 Testing

### **Caso 1: Registro normal**
1. Ir a `/registro-negocio`
2. Llenar formulario (negocio: "Clínica Test")
3. Clic en "Registrar"
4. Ver mensaje de éxito
5. Revisar email
6. Hacer clic en link de confirmación
7. Ser redirigido a `/admin/dashboard`
8. Verificar que el negocio existe con `approval_status = 'pending'`

### **Caso 2: Usuario no confirma email**
1. Registrarse pero NO confirmar email
2. Intentar login → Supabase rechaza (email no confirmado)
3. Verificar que NO existe perfil en `profiles`
4. Verificar que NO existe negocio en `businesses`
5. Verificar que SÍ existe registro en `pending_registrations`

### **Caso 3: Confirmar email más tarde**
1. Registrarse → no confirmar inmediatamente
2. Esperar 1 hora (o días)
3. Confirmar email
4. Trigger se ejecuta → crea perfil + negocio
5. Login exitoso

---

## 📊 Verificación en Base de Datos

```sql
-- Ver registros pendientes de confirmación
SELECT 
  email,
  full_name,
  business_name,
  processed,
  created_at
FROM pending_registrations
ORDER BY created_at DESC;

-- Ver usuarios que confirmaron email
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NOT NULL
ORDER BY created_at DESC;

-- Ver perfiles creados automáticamente
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Ver negocios creados por el trigger
SELECT 
  b.id,
  b.name,
  b.approval_status,
  b.plan_type,
  u.email,
  u.email_confirmed_at
FROM businesses b
JOIN auth.users u ON b.owner_id = u.id
ORDER BY b.created_at DESC;
```

---

## ⚠️ Importante

### **NO ejecutar estos scripts (obsoletos):**
- ❌ `scripts/fix-signup-race-condition.sql` - Reemplazado por el nuevo flujo

### **Archivos modificados:**
- ✅ `app/registro-negocio/page.tsx` - Ahora guarda en pending_registrations
- ✅ Mensaje de éxito actualizado

### **Orden de ejecución:**
1. `scripts/add-approval-system.sql`
2. `scripts/fix-email-confirmation-flow.sql`
3. Probar registro completo

---

## 🔍 Troubleshooting

### Error: "Cannot insert into pending_registrations"
- Verificar que la tabla existe: `\dt pending_registrations`
- Verificar RLS policies
- El usuario debe estar autenticado (aunque luego se haga logout)

### Error: "Profile not found" al hacer login
- Verificar que el trigger `on_email_confirmed` existe
- Verificar que el email está confirmado: `SELECT email_confirmed_at FROM auth.users WHERE email = '...'`
- Verificar logs del trigger: `SELECT * FROM pending_registrations WHERE email = '...'`

### Perfil/Negocio no se crearon al confirmar email
- Verificar que existe registro en `pending_registrations` con `processed = false`
- Verificar que el trigger está activo: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_email_confirmed'`
- Revisar errores en Supabase Logs
