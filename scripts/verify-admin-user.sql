-- Script para verificar y corregir el usuario admin
-- Ejecuta esto en Supabase SQL Editor para verificar que el usuario tenga el rol correcto

-- PASO 1: Buscar el usuario por email
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as user_created_at,
  p.role,
  p.id as profile_id,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'super@createam.cloud';

-- PASO 2: Si el usuario existe pero no tiene perfil, crearlo:
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obtener el ID del usuario
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'super@createam.cloud';
  
  IF v_user_id IS NOT NULL THEN
    -- Crear perfil si no existe
    INSERT INTO profiles (id, role, full_name, created_at, updated_at)
    VALUES (v_user_id, 'admin', 'Super Admin', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Perfil creado/verificado para usuario: %', v_user_id;
  ELSE
    RAISE NOTICE 'Usuario no encontrado con email: super@createam.cloud';
  END IF;
END $$;

-- PASO 3: Asegurar que el rol sea 'admin' (actualizar si es necesario):
UPDATE profiles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE id = (SELECT id FROM auth.users WHERE email = 'super@createam.cloud')
  AND (role IS NULL OR role != 'admin');

-- PASO 4: Verificar el resultado final:
SELECT 
  u.id as user_id,
  u.email,
  p.role,
  p.full_name,
  p.updated_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'super@createam.cloud';
