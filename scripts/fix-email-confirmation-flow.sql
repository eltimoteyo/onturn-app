-- ============================================
-- OnTurn - Sistema de Confirmación por Email
-- ============================================
-- Los perfiles y negocios NO se crean hasta que
-- el usuario confirme su email
-- ============================================

-- 1. Crear tabla temporal para datos pendientes de confirmación
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'business_owner',
  
  -- Datos del negocio
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_category_id UUID REFERENCES categories(id),
  business_address TEXT,
  business_city TEXT,
  business_state TEXT,
  business_phone TEXT,
  business_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_pending_registrations_user_id ON pending_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_processed ON pending_registrations(processed);

-- 3. Función que se ejecuta cuando el usuario confirma su email
CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  pending_reg RECORD;
  new_business_id UUID;
  business_slug TEXT;
BEGIN
  -- Solo ejecutar si el email se confirmó (cambió de NULL a una fecha)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Buscar si hay un registro pendiente para este usuario
    SELECT * INTO pending_reg
    FROM public.pending_registrations
    WHERE user_id = NEW.id AND processed = false
    LIMIT 1;
    
    -- Si existe registro pendiente, procesarlo
    IF FOUND THEN
      
      -- Crear perfil del usuario
      INSERT INTO public.profiles (id, full_name, role)
      VALUES (NEW.id, pending_reg.full_name, pending_reg.role::user_role)
      ON CONFLICT (id) DO NOTHING;
      
      -- Generar slug único para el negocio
      business_slug := lower(regexp_replace(pending_reg.business_name, '[^a-z0-9]+', '-', 'g'));
      business_slug := trim(both '-' from business_slug);
      business_slug := business_slug || '-' || substring(md5(NEW.id::text) from 1 for 6);
      
      -- Crear negocio
      INSERT INTO public.businesses (
        owner_id,
        name,
        slug,
        description,
        category_id,
        address,
        city,
        state,
        phone,
        email,
        auto_confirm,
        is_active,
        approval_status,
        is_publicly_visible,
        plan_type,
        max_specialists,
        max_receptionists,
        max_users
      ) VALUES (
        NEW.id,
        pending_reg.business_name,
        business_slug,
        pending_reg.business_description,
        pending_reg.business_category_id,
        pending_reg.business_address,
        pending_reg.business_city,
        pending_reg.business_state,
        pending_reg.business_phone,
        COALESCE(pending_reg.business_email, pending_reg.email),
        false,
        true,
        'pending',
        false,
        'free',
        1,
        0,
        1
      )
      RETURNING id INTO new_business_id;
      
      -- Crear solicitud de registro para el admin
      INSERT INTO public.tenant_registration_requests (
        applicant_email,
        applicant_name,
        applicant_user_id,
        business_name,
        business_description,
        business_category_id,
        business_address,
        business_city,
        business_state,
        business_phone,
        business_email,
        status
      ) VALUES (
        pending_reg.email,
        pending_reg.full_name,
        NEW.id,
        pending_reg.business_name,
        pending_reg.business_description,
        pending_reg.business_category_id,
        pending_reg.business_address,
        pending_reg.business_city,
        pending_reg.business_state,
        pending_reg.business_phone,
        COALESCE(pending_reg.business_email, pending_reg.email),
        'pending'
      );
      
      -- Marcar como procesado
      UPDATE public.pending_registrations
      SET processed = true, processed_at = NOW()
      WHERE id = pending_reg.id;
      
      RAISE NOTICE 'Registro completado para usuario %: perfil y negocio creados', NEW.email;
    ELSE
      -- No hay registro pendiente, solo crear perfil básico como customer
      INSERT INTO public.profiles (id, full_name, role)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
      )
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE 'Perfil básico creado para usuario %', NEW.email;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Crear trigger en auth.users para cuando se confirma el email
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_email_confirmed();

-- 5. RLS para pending_registrations (solo el usuario puede ver su propio registro)
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Los usuarios pueden ver su propia solicitud" ON pending_registrations;
CREATE POLICY "Los usuarios pueden ver su propia solicitud"
  ON pending_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Los usuarios pueden insertar su propia solicitud" ON pending_registrations;
CREATE POLICY "Los usuarios pueden insertar su propia solicitud"
  ON pending_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Comentarios
COMMENT ON TABLE public.pending_registrations IS 
  'Almacena datos de registro temporalmente hasta que el usuario confirme su email';
COMMENT ON FUNCTION public.handle_email_confirmed() IS 
  'Crea automáticamente perfil y negocio cuando el usuario confirma su email';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver triggers activos
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name IN ('on_email_confirmed')
ORDER BY trigger_name;

-- Ver registros pendientes
SELECT 
  email,
  full_name,
  business_name,
  processed,
  created_at
FROM pending_registrations
ORDER BY created_at DESC;
