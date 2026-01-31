-- ============================================
-- OnTurn - Script para Crear Usuario de Prueba
-- Ejecutar este script ANTES de insert-test-businesses.sql
-- ============================================

-- Este script crea un usuario de prueba usando las funciones de administración de Supabase
-- IMPORTANTE: Este script debe ejecutarse en Supabase SQL Editor con permisos de administrador

-- Opción 1: Usar la función auth.users (requiere permisos especiales)
-- Si tienes acceso a auth.users directamente, puedes usar esto:

DO $$
DECLARE
  test_user_id UUID;
  existing_user_id UUID;
BEGIN
  -- Verificar si el usuario ya existe
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'test-business@onturn.com';
  
  -- Si no existe, crear el usuario
  IF existing_user_id IS NULL THEN
    -- Generar UUID para el usuario
    test_user_id := gen_random_uuid();
    
    -- Crear usuario en auth.users
    -- NOTA: Esto requiere permisos de administrador en Supabase
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      test_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test-business@onturn.com',
      crypt('Test123456', gen_salt('bf')),
      NOW(),
      NULL,
      NULL,
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Crear perfil para el usuario
    INSERT INTO profiles (id, full_name, role, created_at, updated_at)
    VALUES (
      test_user_id,
      'Usuario de Prueba',
      'business_owner',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = 'Usuario de Prueba',
        role = 'business_owner',
        updated_at = NOW();
    
    RAISE NOTICE 'Usuario creado exitosamente con ID: %', test_user_id;
  ELSE
    RAISE NOTICE 'El usuario test-business@onturn.com ya existe con ID: %', existing_user_id;
    
    -- Asegurar que el perfil existe
    INSERT INTO profiles (id, full_name, role, created_at, updated_at)
    VALUES (
      existing_user_id,
      'Usuario de Prueba',
      'business_owner',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = 'Usuario de Prueba',
        role = 'business_owner',
        updated_at = NOW();
  END IF;
END $$;

-- Verificar que el usuario fue creado
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'test-business@onturn.com';

-- Verificar que el perfil fue creado
SELECT 
  id,
  full_name,
  role
FROM profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'test-business@onturn.com'
);
