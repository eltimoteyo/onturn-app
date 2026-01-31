-- Asegurar que el perfil del super admin existe y tiene el rol correcto
-- Debes ejecutar esto en el SQL Editor de Supabase
-- IMPORTANTE: Supabase crea el usuario en auth.users, pero nuestro sistema NECESITA
-- un registro espejo en la tabla 'public.profiles'.

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'super@createam.cloud';
BEGIN
  -- 1. Buscar el ID del usuario por su email en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'El usuario % no existe en auth.users. Debes crearlo primero desde el panel de Authentication o haciendo Sign Up.', v_email;
  ELSE
    -- 2. Insertar o actualizar su perfil en public.profiles
    INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
    VALUES (
      v_user_id, 
      'Super Admin', 
      'admin', 
      NOW(), 
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'admin',
      updated_at = NOW();
      
    RAISE NOTICE 'Perfil actualizado correctamente para el usuario % (ID: %)', v_email, v_user_id;
  END IF;
END $$;
