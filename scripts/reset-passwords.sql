-- ============================================
-- Ver emails de usuarios existentes y resetear contraseñas
-- ============================================

-- 1. VER EMAILS Y ROLES DE TUS USUARIOS ACTUALES
SELECT 
  u.email,
  p.role as tipo_usuario,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  CASE p.role
    WHEN 'customer' THEN '👤 LOGIN en /login → Puede hacer reservas'
    WHEN 'business_owner' THEN '🏢 LOGIN en /admin/login → Acceso completo al admin'
    WHEN 'admin' THEN '⚙️ LOGIN en /admin/login → Acceso total'
    ELSE 'Desconocido'
  END as descripcion_acceso
FROM auth.users u
JOIN profiles p ON p.id = u.id
ORDER BY 
  CASE p.role
    WHEN 'admin' THEN 1
    WHEN 'business_owner' THEN 2
    WHEN 'customer' THEN 3
  END;

-- 2. VER SI EL BUSINESS_OWNER TIENE NEGOCIO ASIGNADO
SELECT 
  u.email as email_owner,
  b.name as negocio,
  b.slug,
  b.is_active as activo,
  CASE 
    WHEN b.id IS NULL THEN '⚠️ NO TIENE NEGOCIO - Necesita crear uno'
    ELSE '✅ Tiene negocio asignado'
  END as estado
FROM auth.users u
JOIN profiles p ON p.id = u.id
LEFT JOIN businesses b ON b.owner_id = u.id
WHERE p.role = 'business_owner';

-- ============================================
-- RESETEAR CONTRASEÑAS (elige UNA opción)
-- ============================================

-- OPCIÓN A: Establecer la MISMA contraseña para todos (Testing123)
-- Descomenta las siguientes líneas si quieres usar esta opción:

/*
UPDATE auth.users 
SET encrypted_password = crypt('Testing123', gen_salt('bf')),
    email_confirmed_at = NOW()  -- También confirma el email
WHERE id IN (SELECT id FROM profiles WHERE role IN ('customer', 'business_owner', 'admin'));

-- Verificar que se actualizaron:
SELECT 'Contraseña cambiada a: Testing123' as mensaje, email, 
       CASE (SELECT role FROM profiles WHERE id = auth.users.id)
         WHEN 'customer' THEN '👤 Customer'
         WHEN 'business_owner' THEN '🏢 Business Owner'
         WHEN 'admin' THEN '⚙️ Admin'
       END as tipo
FROM auth.users 
WHERE id IN (SELECT id FROM profiles WHERE role IN ('customer', 'business_owner', 'admin'));
*/

-- OPCIÓN B: Establecer contraseñas DIFERENTES por rol
-- Descomenta las siguientes líneas si quieres usar esta opción:

/*
-- Customer: password = Cliente123
UPDATE auth.users 
SET encrypted_password = crypt('Cliente123', gen_salt('bf')),
    email_confirmed_at = NOW()
WHERE id = (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1);

-- Business Owner: password = Owner123
UPDATE auth.users 
SET encrypted_password = crypt('Owner123', gen_salt('bf')),
    email_confirmed_at = NOW()
WHERE id = (SELECT id FROM profiles WHERE role = 'business_owner' LIMIT 1);

-- Admin: password = Admin123
UPDATE auth.users 
SET encrypted_password = crypt('Admin123', gen_salt('bf')),
    email_confirmed_at = NOW()
WHERE id = (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1);

-- Verificar:
SELECT 
  u.email,
  CASE p.role
    WHEN 'customer' THEN 'Cliente123'
    WHEN 'business_owner' THEN 'Owner123'
    WHEN 'admin' THEN 'Admin123'
  END as nueva_password,
  p.role
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role IN ('customer', 'business_owner', 'admin')
ORDER BY p.role;
*/

-- ============================================
-- DESPUÉS DE RESETEAR LAS CONTRASEÑAS
-- ============================================
-- 
-- Usa estos usuarios así:
-- 
-- 1. CUSTOMER (Cliente):
--    - Email: [el que aparezca en consulta 1]
--    - Password: Cliente123 (opción B) o Testing123 (opción A)
--    - URL: http://localhost:3000/login
--    - Puede: Ver negocios, hacer reservas, ver /mis-reservas
-- 
-- 2. BUSINESS_OWNER (Dueño):
--    - Email: [el que aparezca en consulta 1]
--    - Password: Owner123 (opción B) o Testing123 (opción A)
--    - URL: http://localhost:3000/admin/login
--    - Puede: Gestionar su negocio, especialistas, reservas, configuración
-- 
-- 3. ADMIN (Administrador):
--    - Email: [el que aparezca en consulta 1]
--    - Password: Admin123 (opción B) o Testing123 (opción A)
--    - URL: http://localhost:3000/admin/login
--    - Puede: Acceso total al sistema
-- 
-- ============================================
