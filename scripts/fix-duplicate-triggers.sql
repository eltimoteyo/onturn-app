-- =====================================================
-- VER TODOS LOS TRIGGERS Y ELIMINAR DUPLICADOS
-- =====================================================

-- 1. VER TODOS LOS TRIGGERS en auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement,
  action_orientation
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. VER CÓDIGO DE TODAS LAS FUNCIONES RELACIONADAS
SELECT 
  proname as nombre_funcion,
  pg_get_functiondef(oid) as codigo_completo
FROM pg_proc
WHERE proname IN ('handle_new_user', 'handle_new_user_signup', 'create_profile_for_new_user')
   OR proname LIKE '%profile%'
   OR proname LIKE '%signup%'
ORDER BY proname;

-- =====================================================
-- SOLUCIÓN: ELIMINAR TODOS Y CREAR UNO SOLO
-- =====================================================
-- Ejecuta estas líneas una por una:

/*
-- Paso 1: Eliminar TODOS los triggers en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_for_new_user ON auth.users;
DROP TRIGGER IF EXISTS on_new_user_signup ON auth.users;

-- Paso 2: Eliminar TODAS las funciones viejas
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user_signup() CASCADE;
DROP FUNCTION IF EXISTS create_profile_for_new_user() CASCADE;

-- Paso 3: Crear la función CORRECTA (con ON CONFLICT)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Paso 4: Crear el trigger ÚNICO
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Paso 5: VERIFICAR que solo hay UNO
SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';
*/
