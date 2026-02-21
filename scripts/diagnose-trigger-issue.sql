-- =====================================================
-- DIAGNOSTICAR PROBLEMA DEL TRIGGER
-- =====================================================

-- 1. Ver si el trigger está duplicado (ejecutándose 2 veces)
SELECT 
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. Ver la función del trigger
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc
WHERE proname = 'handle_new_user_signup';

-- 3. Verificar perfiles duplicados para un usuario
SELECT 
  id,
  full_name,
  role,
  email,
  created_at
FROM profiles
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'yiyofe9767@laciu.com'
);

-- 4. Ver todos los usuarios con el mismo email (si hay duplicados)
SELECT 
  u.id,
  u.email,
u.created_at,
  u.email_confirmed_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'yiyofe9767@laciu.com'
ORDER BY u.created_at DESC;
