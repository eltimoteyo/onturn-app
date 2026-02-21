-- ============================================
-- OnTurn - Verificar Usuarios Existentes
-- ============================================
-- Este script te muestra todos los usuarios que ya existen
-- en tu base de datos con sus roles y datos asociados
-- ============================================

-- 1. Ver todos los usuarios con sus perfiles y roles
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  u.created_at as fecha_creacion,
  p.full_name as nombre_completo,
  p.phone as telefono,
  p.role,
  CASE p.role
    WHEN 'customer' THEN '👤 Cliente'
    WHEN 'business_owner' THEN '🏢 Dueño de Negocio'
    WHEN 'receptionist' THEN '📋 Recepcionista'
    WHEN 'admin' THEN '⚙️ Administrador'
    ELSE '❓ Sin rol'
  END as tipo_usuario,
  EXISTS(SELECT 1 FROM specialists s WHERE s.email = u.email) as es_especialista
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- 2. Ver negocios y sus dueños
SELECT 
  b.id as business_id,
  b.name as nombre_negocio,
  b.slug,
  b.is_active as activo,
  u.email as email_dueno,
  p.full_name as nombre_dueno,
  b.created_at as fecha_creacion
FROM businesses b
JOIN auth.users u ON u.id = b.owner_id
LEFT JOIN profiles p ON p.id = u.id
ORDER BY b.created_at DESC;

-- 3. Ver especialistas vinculados a negocios
SELECT 
  s.id as specialist_id,
  s.name as nombre_especialista,
  s.email as email_especialista,
  s.is_active as activo,
  b.name as negocio,
  sp.name as especialidad,
  s.created_at as fecha_creacion
FROM specialists s
LEFT JOIN businesses b ON b.id = s.business_id
LEFT JOIN specialties sp ON sp.id = s.specialty_id
ORDER BY s.created_at DESC;

-- 4. Resumen por roles
SELECT 
  p.role,
  COUNT(*) as cantidad,
  CASE p.role
    WHEN 'customer' THEN '👤 Clientes regulares'
    WHEN 'business_owner' THEN '🏢 Dueños de negocios'
    WHEN 'receptionist' THEN '📋 Recepcionistas'
    WHEN 'admin' THEN '⚙️ Administradores'
    ELSE '❓ Sin rol asignado'
  END as descripcion
FROM profiles p
GROUP BY p.role
ORDER BY COUNT(*) DESC;

-- 4b. Especialistas (vinculados desde tabla specialists)
SELECT 
  'Especialistas' as categoria,
  COUNT(*) as cantidad,
  '👨‍⚕️ Usuarios vinculados como especialistas' as descripcion
FROM specialists;

-- 5. Usuarios sin perfil (puede indicar problemas)
SELECT 
  u.id,
  u.email,
  u.created_at,
  '⚠️ USUARIO SIN PERFIL - Necesita corrección' as estado
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 6. Usuarios que pueden hacer login como admin
SELECT 
  u.email as email,
  p.full_name as nombre,
  p.role,
  CASE 
    WHEN p.role = 'business_owner' THEN 
      COALESCE((SELECT name FROM businesses WHERE owner_id = u.id LIMIT 1), '⚠️ Sin negocio asignado')
    ELSE 'N/A'
  END as entidad_vinculada,
  '/admin/login' as url_login
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role IN ('business_owner', 'admin', 'receptionist')
ORDER BY p.role;

-- 6b. Usuarios especialistas (pueden tener acceso limitado al admin)
SELECT 
  s.email as email,
  s.name as nombre,
  'Especialista' as role,
  CONCAT(b.name, ' - ', COALESCE(sp.name, 'Sin especialidad')) as entidad_vinculada,
  '/admin/login (acceso limitado)' as url_login,
  s.is_active as activo
FROM specialists s
LEFT JOIN businesses b ON b.id = s.business_id
LEFT JOIN specialties sp ON sp.id = s.specialty_id
WHERE s.email IS NOT NULL
ORDER BY s.created_at DESC;

-- 7. Usuarios que pueden hacer login como cliente
SELECT 
  u.email as email,
  p.full_name as nombre,
  p.role,
  (SELECT COUNT(*) FROM appointments WHERE customer_id = u.id) as total_reservas,
  '/login' as url_login
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE p.role = 'customer'
ORDER BY u.created_at DESC;

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================
-- 
-- Para usar estos usuarios en el sistema:
-- 
-- 1. Si quieres ver las contraseñas (NO POSIBLE):
--    Las contraseñas están encriptadas y NO se pueden recuperar.
--    Si necesitas acceso, debes:
--    - Usar la función de "Olvidé mi contraseña" en la app
--    - O cambiar la contraseña desde Supabase Dashboard
-- 
-- 2. Para resetear la contraseña de un usuario:
--    Ve a: Supabase Dashboard → Authentication → Users
--    Haz click en el usuario → "Send Password Reset Email"
-- 
-- 3. Para cambiar el rol de un usuario:
--    UPDATE profiles 
--    SET role = 'NUEVO_ROL' 
--    WHERE id = (SELECT id FROM auth.users WHERE email = 'email@ejemplo.com');
--    
--    Roles válidos: customer, business_owner, receptionist, admin
--    Nota: Los especialistas se gestionan desde la tabla 'specialists'
-- 
-- 4. Para crear un nuevo negocio para un business_owner:
--    Ver script: insert-test-businesses.sql
-- 
-- ============================================
