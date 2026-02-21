-- ============================================
-- OnTurn - Fix SignUp Race Condition
-- ============================================
-- Este script crea un trigger que automáticamente crea
-- el perfil del usuario cuando se registra en auth.users
-- Esto evita la race condition con useAuth
-- ============================================

-- 1. Crear función que maneje nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar perfil automáticamente con metadata del signUp
  INSERT INTO public.profiles (id, full_name, role, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'customer'::user_role),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Comentario
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Crea automáticamente un perfil cuando se registra un nuevo usuario. ' ||
  'Usa metadata de signUp: full_name, role, avatar_url';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver triggers activos
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
