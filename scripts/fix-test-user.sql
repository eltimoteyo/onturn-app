-- ============================================
-- Script para Verificar y Corregir Usuario de Prueba
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Verificar si el usuario existe
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'test-business@onturn.com';

-- 2. Si el usuario existe pero no está confirmado, confirmarlo
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'test-business@onturn.com' 
  AND email_confirmed_at IS NULL;

-- 3. Verificar que el perfil existe
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'test-business@onturn.com';

-- 4. Si el perfil no existe, crearlo
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT 
  id,
  'Usuario de Prueba',
  'business_owner',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'test-business@onturn.com'
  AND id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE
SET full_name = 'Usuario de Prueba',
    role = 'business_owner',
    updated_at = NOW();

-- 5. Verificación final
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Usuario confirmado'
    ELSE '❌ Usuario NO confirmado'
  END as estado
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'test-business@onturn.com';
