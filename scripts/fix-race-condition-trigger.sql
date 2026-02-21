-- ============================================
-- OnTurn - Fix Race Condition con Trigger Automático
-- ============================================
-- Este trigger crea el perfil AUTOMÁTICAMENTE cuando
-- se crea un usuario en auth.users
-- Soluciona el error PGRST116
-- ============================================

-- 1. Crear función que cree el perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insertar perfil automáticamente cuando se crea usuario
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

-- 2. Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Crear trigger que se ejecuta DESPUÉS de INSERT en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- 4. Comentario
COMMENT ON FUNCTION public.handle_new_user_signup() IS 
  'Crea automáticamente un perfil cuando se registra un nuevo usuario. Soluciona race condition donde useAuth intenta leer perfil antes de que exista.';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver que el trigger esté activo
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- IMPORTANTE
-- ============================================
-- 
-- Después de ejecutar este script:
-- 
-- 1. El código NO necesita crear el perfil manualmente
-- 2. El perfil se crea AUTOMÁTICAMENTE al hacer signUp
-- 3. Cuando useAuth intenta leerlo, YA EXISTE
-- 4. No más error PGRST116
-- 
-- ============================================
