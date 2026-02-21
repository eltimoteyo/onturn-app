-- =====================================================
-- DIAGNÓSTICO COMPLETO DEL PROBLEMA
-- =====================================================

-- 1. TRIGGERS EN auth.users (puede haber duplicados)
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. VER CÓDIGO DE LA FUNCIÓN handle_new_user_signup
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user_signup';

-- 3. VER TODAS LAS FUNCIONES RELACIONADAS CON SIGNUP
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname LIKE '%signup%' OR proname LIKE '%user%'
  AND prokind = 'f'
ORDER BY proname;

-- 4. VER SI HAY TRIGGERS DUPLICADOS (MISMO EVENTO)
SELECT 
  event_object_table,
  trigger_name,
  COUNT(*) as veces
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
GROUP BY event_object_table, trigger_name
HAVING COUNT(*) > 1;
