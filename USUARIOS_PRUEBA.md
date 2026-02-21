# 🧪 Usuarios de Prueba - OnTurn

Este documento contiene las credenciales de usuarios de prueba para cada rol del sistema.

---

## 👥 Usuarios Disponibles

### 1. 👤 **CUSTOMER** (Cliente Regular)

**Credenciales:**
- **Email:** `cliente@onturn.com`
- **Password:** `Cliente123`
- **Rol:** `customer`

**Permisos:**
- ✅ Ver negocios y servicios disponibles
- ✅ Hacer reservas
- ✅ Ver sus propias reservas en `/mis-reservas`
- ✅ Editar su perfil en `/perfil`
- ❌ No tiene acceso al panel de administración
- ❌ No puede gestionar negocios ni especialistas

**Páginas accesibles:**
- `/` - Landing page
- `/reservas` - Explorar servicios
- `/mis-reservas` - Mis reservas
- `/perfil` - Mi perfil
- `/[slug]/reservar` - Reservar en un negocio

---

### 2. 🏢 **BUSINESS OWNER** (Dueño de Negocio/Tenant)

**Credenciales:**
- **Email:** `dueno@onturn.com`
- **Password:** `Dueno123`
- **Rol:** `business_owner`

**Permisos:**
- ✅ Acceso completo al panel de administración
- ✅ Gestionar su negocio (datos, horarios, configuración)
- ✅ Gestionar especialistas de su negocio
- ✅ Gestionar especialidades/servicios
- ✅ Ver y gestionar todas las reservas de su negocio
- ✅ Ver usuarios registrados
- ❌ No puede crear/modificar otros negocios
- ❌ No tiene acceso al super-admin

**Páginas accesibles:**
- `/admin/dashboard` - Dashboard principal
- `/admin/configuracion` - Configuración del negocio
- `/admin/especialistas` - Gestión de especialistas
- `/admin/especialidades` - Gestión de servicios
- `/admin/reservas` - Todas las reservas del negocio
- `/admin/usuarios` - Usuarios registrados
- `/perfil` - Su perfil personal

**Negocio asignado:**
- Nombre: "Clínica Dental OnTurn"
- Slug: `clinica-onturn`

---

### 3. 👨‍⚕️ **SPECIALIST** (Especialista - Acceso Limitado)

**Credenciales:**
- **Email:** `especialista@onturn.com`
- **Password:** `Especialista123`
- **Rol:** `specialist`

**Permisos:**
- ✅ Ver reservas asignadas a él/ella
- ✅ Gestionar sus propias reservas
- ✅ Editar su perfil
- ✅ Ver su agenda/calendario
- ❌ No puede ver reservas de otros especialistas
- ❌ No puede gestionar el negocio
- ❌ No puede crear/eliminar especialistas
- ❌ No tiene acceso a configuración del negocio
- ❌ No puede ver panel de administración completo

**Páginas accesibles:**
- `/admin/reservas-especialista` - Solo sus reservas
- `/perfil` - Su perfil
- Acceso limitado (sin sidebar completo)

**Especialista asignado:**
- Nombre: "Dr. Carlos Mendoza"
- Especialidad: "Odontología General"
- Negocio: "Clínica Dental OnTurn"

---

## 🚀 Cómo Crear los Usuarios

### Opción 1: Script SQL Automático (RECOMENDADO)

Ejecuta el siguiente script en **Supabase SQL Editor**:

```sql
-- ============================================
-- OnTurn - Crear Usuarios de Prueba
-- ============================================

-- 1. CUSTOMER (Cliente)
DO $$
DECLARE
  customer_id UUID;
BEGIN
  -- Generar UUID
  customer_id := gen_random_uuid();
  
  -- Insertar en auth.users (requiere permisos admin)
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    customer_id,
    '00000000-0000-0000-0000-000000000000',
    'cliente@onturn.com',
    crypt('Cliente123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Cliente de Prueba"}',
    'authenticated',
    'authenticated'
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Crear perfil
  INSERT INTO profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    customer_id,
    'Cliente de Prueba',
    'customer',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE
  SET full_name = 'Cliente de Prueba',
      role = 'customer';
      
  RAISE NOTICE 'Usuario cliente@onturn.com creado exitosamente';
END $$;

-- 2. BUSINESS OWNER (Dueño de Negocio)
DO $$
DECLARE
  owner_id UUID;
  business_id UUID;
BEGIN
  -- Generar UUIDs
  owner_id := gen_random_uuid();
  business_id := gen_random_uuid();
  
  -- Insertar en auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    owner_id,
    '00000000-0000-0000-0000-000000000000',
    'dueno@onturn.com',
    crypt('Dueno123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dueño de Negocio"}',
    'authenticated',
    'authenticated'
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Crear perfil
  INSERT INTO profiles (id, full_name, phone, role, created_at, updated_at)
  VALUES (
    owner_id,
    'Dueño de Negocio',
    '+51 999 888 777',
    'business_owner',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE
  SET full_name = 'Dueño de Negocio',
      role = 'business_owner';
  
  -- Crear negocio de prueba
  INSERT INTO businesses (
    id,
    owner_id,
    name,
    slug,
    description,
    address,
    city,
    phone,
    email,
    auto_confirm,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    business_id,
    owner_id,
    'Clínica Dental OnTurn',
    'clinica-onturn',
    'Clínica dental moderna con los mejores especialistas',
    'Av. Principal 123',
    'Lima',
    '+51 999 888 777',
    'contacto@clinica-onturn.com',
    true,
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;
  
  RAISE NOTICE 'Usuario dueno@onturn.com y negocio creados exitosamente';
END $$;

-- 3. SPECIALIST (Especialista)
DO $$
DECLARE
  specialist_user_id UUID;
  specialist_id UUID;
  business_id UUID;
  specialty_id UUID;
BEGIN
  -- Obtener el business_id del negocio creado anteriormente
  SELECT id INTO business_id FROM businesses WHERE slug = 'clinica-onturn';
  
  -- Generar UUIDs
  specialist_user_id := gen_random_uuid();
  specialist_id := gen_random_uuid();
  specialty_id := gen_random_uuid();
  
  -- Insertar en auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    specialist_user_id,
    '00000000-0000-0000-0000-000000000000',
    'especialista@onturn.com',
    crypt('Especialista123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Dr. Carlos Mendoza"}',
    'authenticated',
    'authenticated'
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Crear perfil
  INSERT INTO profiles (id, full_name, phone, role, created_at, updated_at)
  VALUES (
    specialist_user_id,
    'Dr. Carlos Mendoza',
    '+51 999 666 555',
    'specialist',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE
  SET full_name = 'Dr. Carlos Mendoza',
      role = 'specialist';
  
  -- Crear especialidad (si no existe)
  INSERT INTO specialties (id, business_id, name, description, duration_minutes, price, is_active, created_at, updated_at)
  VALUES (
    specialty_id,
    business_id,
    'Odontología General',
    'Consulta general odontológica',
    30,
    50.00,
    true,
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;
  
  -- Crear especialista vinculado al negocio
  INSERT INTO specialists (id, business_id, specialty_id, name, email, phone, is_active, created_at, updated_at)
  VALUES (
    specialist_id,
    business_id,
    specialty_id,
    'Dr. Carlos Mendoza',
    'especialista@onturn.com',
    '+51 999 666 555',
    true,
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Usuario especialista@onturn.com y especialista creados exitosamente';
END $$;

-- Verificar que todo se creó correctamente
SELECT 
  u.email,
  p.full_name,
  p.role,
  CASE 
    WHEN p.role = 'business_owner' THEN (SELECT COUNT(*) FROM businesses WHERE owner_id = u.id)::text || ' negocios'
    WHEN p.role = 'specialist' THEN (SELECT COUNT(*) FROM specialists WHERE email = u.email)::text || ' asignaciones'
    ELSE 'N/A'
  END as info
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('cliente@onturn.com', 'dueno@onturn.com', 'especialista@onturn.com')
ORDER BY p.role;
```

---

### Opción 2: Desde Supabase Dashboard (Manual)

Si el script SQL no funciona por permisos:

#### Crear CUSTOMER:
1. Supabase Dashboard → Authentication → Users → "Add User"
2. Email: `cliente@onturn.com`, Password: `Cliente123`
3. ✅ Marcar "Auto Confirm User"
4. SQL Editor:
```sql
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT id, 'Cliente de Prueba', 'customer', NOW(), NOW()
FROM auth.users WHERE email = 'cliente@onturn.com'
ON CONFLICT (id) DO UPDATE SET role = 'customer';
```

#### Crear BUSINESS OWNER:
1. Crear usuario: `dueno@onturn.com` / `Dueno123`
2. SQL Editor:
```sql
-- Crear perfil
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT id, 'Dueño de Negocio', 'business_owner', NOW(), NOW()
FROM auth.users WHERE email = 'dueno@onturn.com'
ON CONFLICT (id) DO UPDATE SET role = 'business_owner';

-- Crear negocio
INSERT INTO businesses (id, owner_id, name, slug, description, auto_confirm, is_active, created_at, updated_at)
SELECT gen_random_uuid(), id, 'Clínica Dental OnTurn', 'clinica-onturn', 'Clínica de prueba', true, true, NOW(), NOW()
FROM auth.users WHERE email = 'dueno@onturn.com';
```

#### Crear SPECIALIST:
1. Crear usuario: `especialista@onturn.com` / `Especialista123`
2. SQL Editor:
```sql
-- Crear perfil
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT id, 'Dr. Carlos Mendoza', 'specialist', NOW(), NOW()
FROM auth.users WHERE email = 'especialista@onturn.com'
ON CONFLICT (id) DO UPDATE SET role = 'specialist';

-- Crear especialista (vinculado al negocio del owner)
INSERT INTO specialists (id, business_id, name, email, phone, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  b.id,
  'Dr. Carlos Mendoza',
  'especialista@onturn.com',
  '+51 999 666 555',
  true,
  NOW(),
  NOW()
FROM businesses b
WHERE b.slug = 'clinica-onturn';
```

---

## ✅ Verificación

Después de crear los usuarios, ejecuta esta consulta para verificar:

```sql
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as confirmado,
  p.full_name,
  p.role,
  CASE 
    WHEN p.role = 'business_owner' THEN (SELECT name FROM businesses WHERE owner_id = u.id LIMIT 1)
    WHEN p.role = 'specialist' THEN (SELECT name FROM specialists WHERE email = u.email LIMIT 1)
    ELSE 'N/A'
  END as entidad_vinculada
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email IN ('cliente@onturn.com', 'dueno@onturn.com', 'especialista@onturn.com')
ORDER BY 
  CASE p.role
    WHEN 'customer' THEN 1
    WHEN 'business_owner' THEN 2
    WHEN 'specialist' THEN 3
  END;
```

**Resultado esperado:**
```
email                    | confirmado | full_name           | role           | entidad_vinculada
------------------------|-----------|---------------------|----------------|--------------------
cliente@onturn.com      | true      | Cliente de Prueba   | customer       | N/A
dueno@onturn.com        | true      | Dueño de Negocio   | business_owner | Clínica Dental OnTurn
especialista@onturn.com | true      | Dr. Carlos Mendoza | specialist     | Dr. Carlos Mendoza
```

---

## 🧪 Casos de Prueba

### Test 1: Login como CUSTOMER
1. Ir a `/login`
2. Email: `cliente@onturn.com` / Password: `Cliente123`
3. ✅ Debe redirigir a `/reservas`
4. ❌ No debe tener acceso a `/admin/*`

### Test 2: Login como BUSINESS OWNER
1. Ir a `/admin/login`
2. Email: `dueno@onturn.com` / Password: `Dueno123`
3. ✅ Debe redirigir a `/admin/dashboard`
4. ✅ Puede ver todas las secciones del admin
5. ✅ Puede gestionar especialistas y configuración

### Test 3: Login como SPECIALIST
1. Ir a `/admin/login`
2. Email: `especialista@onturn.com` / Password: `Especialista123`
3. ✅ Debe redirigir a `/admin/reservas-especialista`
4. ✅ Solo ve sus propias reservas
5. ❌ No tiene acceso a dashboard, configuración, etc.

### Test 4: Crear Reserva
1. Login como CUSTOMER (`cliente@onturn.com`)
2. Ir a `/clinica-onturn/reservar`
3. Seleccionar fecha, hora, especialista
4. Crear reserva
5. Logout
6. Login como BUSINESS OWNER (`dueno@onturn.com`)
7. Ir a `/admin/reservas`
8. ✅ Debe ver la reserva creada
9. Logout
10. Login como SPECIALIST (`especialista@onturn.com`)
11. Ir a `/admin/reservas-especialista`
12. ✅ Debe ver solo las reservas asignadas a él

---

## 🔒 Seguridad

**IMPORTANTE:** Estos usuarios son **SOLO PARA TESTING/DESARROLLO**

- ❌ NO usar estos emails/passwords en producción
- ❌ NO compartir estos datos públicamente
- ✅ Cambiar contraseñas antes de desplegar a producción
- ✅ Eliminar usuarios de prueba en ambiente productivo
- ✅ Usar variables de entorno para credenciales

---

## 🐛 Solución de Problemas

### Error: "Invalid login credentials"
- Verifica que `email_confirmed_at` no sea NULL:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email IN ('cliente@onturn.com', 'dueno@onturn.com', 'especialista@onturn.com');
```

### Error: "User not found"
- Verifica que el usuario existe en `auth.users`
- Verifica que el perfil existe en `profiles`

### Specialist no puede ver reservas
- Verifica que existe un registro en `specialists` con su email
- Verifica que `is_active = true`
- Verifica que tiene `business_id` asignado

### Business Owner no tiene negocio
- Verifica que existe un registro en `businesses` con su `owner_id`
- Verifica que `is_active = true`

---

**Última actualización:** 16 de Febrero de 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para usar
