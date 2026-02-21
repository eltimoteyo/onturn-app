-- ============================================
-- OnTurn - Crear Usuarios de Prueba
-- ============================================
-- Este script crea 3 usuarios de prueba:
-- 1. Cliente (customer): cliente@onturn.com / Cliente123
-- 2. Dueño de Negocio (business_owner): dueno@onturn.com / Dueno123
-- 3. Especialista (specialist): especialista@onturn.com / Especialista123
--
-- Ejecutar en: Supabase SQL Editor
-- Requiere: Permisos de administrador
-- ============================================

-- 1. CUSTOMER (Cliente Regular)
DO $$
DECLARE
  customer_id UUID;
BEGIN
  -- Generar UUID
  customer_id := gen_random_uuid();
  
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
      
  RAISE NOTICE '✅ Usuario cliente@onturn.com creado exitosamente';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error al crear cliente: %', SQLERRM;
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
      role = 'business_owner',
      phone = '+51 999 888 777';
  
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
    'Av. Principal 123, San Isidro',
    'Lima',
    '+51 999 888 777',
    'contacto@clinica-onturn.com',
    true,
    true,
    NOW(),
    NOW()
  ) ON CONFLICT (slug) DO NOTHING;
  
  RAISE NOTICE '✅ Usuario dueno@onturn.com y negocio creados exitosamente';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error al crear business owner: %', SQLERRM;
END $$;

-- 3. SPECIALIST (Especialista con acceso limitado)
DO $$
DECLARE
  specialist_user_id UUID;
  specialist_id UUID;
  business_id UUID;
  specialty_id UUID;
BEGIN
  -- Obtener el business_id del negocio creado anteriormente
  SELECT id INTO business_id FROM businesses WHERE slug = 'clinica-onturn' LIMIT 1;
  
  IF business_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el negocio clinica-onturn. Ejecuta primero la sección de BUSINESS OWNER.';
  END IF;
  
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
      role = 'specialist',
      phone = '+51 999 666 555';
  
  -- Crear especialidad (si no existe)
  INSERT INTO specialties (id, business_id, name, description, duration_minutes, price, is_active, created_at, updated_at)
  VALUES (
    specialty_id,
    business_id,
    'Odontología General',
    'Consulta general odontológica, revisión dental completa',
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
  
  RAISE NOTICE '✅ Usuario especialista@onturn.com y especialista creados exitosamente';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Error al crear specialist: %', SQLERRM;
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Mostrar todos los usuarios creados
SELECT 
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  p.full_name as nombre,
  p.role,
  p.phone as telefono,
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

-- Mostrar resumen de creación
SELECT 
  '🎉 RESUMEN DE USUARIOS DE PRUEBA' as titulo,
  '' as vacio;

SELECT 
  '👤 CUSTOMER' as rol,
  'cliente@onturn.com' as email,
  'Cliente123' as password,
  '✅ Puede hacer reservas y ver su perfil' as permisos
UNION ALL
SELECT 
  '🏢 BUSINESS OWNER',
  'dueno@onturn.com',
  'Dueno123',
  '✅ Acceso completo al panel de admin'
UNION ALL
SELECT 
  '👨‍⚕️ SPECIALIST',
  'especialista@onturn.com',
  'Especialista123',
  '✅ Solo sus propias reservas';

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- 
-- Si algún usuario ya existe y ves errores, no te preocupes.
-- El script usa ON CONFLICT para evitar duplicados.
-- 
-- Para verificar que los usuarios están confirmados, ejecuta:
-- 
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email IN ('cliente@onturn.com', 'dueno@onturn.com', 'especialista@onturn.com')
-- AND email_confirmed_at IS NULL;
-- 
-- ============================================
