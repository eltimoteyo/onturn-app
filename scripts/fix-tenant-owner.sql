-- Asegurar que el usuario tenant@createam.cloud existe y tiene todo configurado
-- Password recomendada: la misma que usaste para super admin (o crea el usuario primero si no existe)

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'tenant@createam.cloud';
  v_business_id uuid;
BEGIN
  -- 1. Buscar el ID del usuario por su email en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE '⚠️ El usuario % no existe en auth.users.', v_email;
    RAISE NOTICE '➡️ Por favor, regístralo primero desde el Login (/admin/login) o usa el script de creación de usuario.';
  ELSE
    -- 2. Insertar o actualizar su perfil en public.profiles
    INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
    VALUES (
      v_user_id, 
      'Tenant Owner Demo', 
      'business_owner', 
      NOW(), 
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      role = 'business_owner',
      updated_at = NOW();
      
    RAISE NOTICE '✅ Perfil actualizado: Role business_owner asignado a %', v_email;
    
    -- 3. Asegurar que tiene al menos un negocio asociado
    SELECT id INTO v_business_id FROM businesses WHERE owner_id = v_user_id LIMIT 1;
    
    IF v_business_id IS NULL THEN
        INSERT INTO businesses (
            owner_id, name, slug, description, category_id, 
            city, address, phone, email, is_active, auto_confirm
        ) VALUES (
            v_user_id,
            'Negocio Demo del Tenant',
            'demo-tenant-' || substring(v_user_id::text from 1 for 4),
            'Negocio de prueba creado automáticamente',
            (SELECT id FROM categories LIMIT 1), -- Usar primera categoría disponible
            'Lima',
            'Av. Principal 123',
            '+51 999 999 999',
            v_email,
            true,
            true
        );
        RAISE NOTICE '✅ Negocio de prueba creado para el usuario.';
    ELSE
        RAISE NOTICE 'ℹ️ El usuario ya tiene negocios asignados.';
    END IF;

  END IF;
END $$;
