-- ============================================
-- OnTurn - Sistema de Acceso Inmediato con Confirmación Suave
-- ============================================
-- Este es el flujo moderno de SaaS (como Slack, Notion, Vercel):
-- 1. Usuario se registra → Acceso inmediato al dashboard
-- 2. Email enviado (no bloquea acceso)
-- 3. Puede configurar todo mientras espera confirmación
-- 4. Al confirmar email → Puede recibir reservas
-- 5. Al aprobar admin → Aparece en búsquedas públicas
-- ============================================

-- 1. Agregar campos de aprobación a businesses (si no existen)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS is_publicly_visible BOOLEAN DEFAULT false;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Agregar campos de plan/subscription
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free' 
  CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise'));

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS max_specialists INTEGER DEFAULT 1;

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS max_receptionists INTEGER DEFAULT 0;

-- 3. *** NUEVO *** Campo para controlar si puede recibir reservas
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS can_receive_bookings BOOLEAN DEFAULT false;

COMMENT ON COLUMN businesses.can_receive_bookings IS 
  'Si puede recibir reservas (true solo después de confirmar email)';

-- 4. Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_businesses_approval_status ON businesses(approval_status);
CREATE INDEX IF NOT EXISTS idx_businesses_publicly_visible ON businesses(is_publicly_visible);
CREATE INDEX IF NOT EXISTS idx_businesses_plan_type ON businesses(plan_type);
CREATE INDEX IF NOT EXISTS idx_businesses_can_receive_bookings ON businesses(can_receive_bookings);

-- 5. Actualizar negocios existentes (marcarlos como aprobados y activos)
UPDATE businesses 
SET approval_status = 'approved',
    is_publicly_visible = true,
    can_receive_bookings = true,
    approved_at = created_at
WHERE approval_status IS NULL OR approval_status = 'pending';

-- 6. Crear función para verificar límites del plan
CREATE OR REPLACE FUNCTION check_business_plan_limits(
  business_uuid UUID,
  user_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  business_plan TEXT;
  current_specialists INTEGER;
  current_receptionists INTEGER;
  max_specialists_allowed INTEGER;
  max_receptionists_allowed INTEGER;
BEGIN
  SELECT plan_type, max_specialists, max_receptionists
  INTO business_plan, max_specialists_allowed, max_receptionists_allowed
  FROM businesses
  WHERE id = business_uuid;

  SELECT COUNT(*) INTO current_specialists
  FROM specialists
  WHERE business_id = business_uuid AND is_active = true;

  SELECT COUNT(*) INTO current_receptionists
  FROM profiles
  WHERE role = 'receptionist' 
    AND id IN (
      SELECT user_id FROM business_users 
      WHERE business_id = business_uuid AND is_active = true
    );

  IF user_type = 'specialist' THEN
    RETURN current_specialists < max_specialists_allowed;
  ELSIF user_type = 'receptionist' THEN
    RETURN current_receptionists < max_receptionists_allowed;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. *** NUEVO *** Trigger para activar reservas al confirmar email
CREATE OR REPLACE FUNCTION activate_bookings_on_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo ejecutar si el email se confirmó (cambió de NULL a una fecha)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Activar can_receive_bookings para el negocio del usuario
    UPDATE businesses
    SET can_receive_bookings = true
    WHERE owner_id = NEW.id;
    
    RAISE NOTICE 'Reservas activadas para usuario %', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_email_confirmed_activate_bookings ON auth.users;
CREATE TRIGGER on_email_confirmed_activate_bookings
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION activate_bookings_on_email_confirmed();

-- 8. Comentarios descriptivos
COMMENT ON COLUMN businesses.approval_status IS 'Estado de aprobación: pending, approved, rejected';
COMMENT ON COLUMN businesses.is_publicly_visible IS 'Si el negocio aparece en búsquedas públicas (solo si está aprobado)';
COMMENT ON COLUMN businesses.plan_type IS 'Plan de suscripción: free (1 usuario), basic, pro, enterprise';
COMMENT ON COLUMN businesses.max_specialists IS 'Máximo de especialistas permitidos según el plan';
COMMENT ON COLUMN businesses.max_receptionists IS 'Máximo de recepcionistas permitidos según el plan';

COMMENT ON FUNCTION activate_bookings_on_email_confirmed() IS 
  'Activa can_receive_bookings = true cuando el usuario confirma su email';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver configuración de todos los negocios
SELECT 
  name,
  approval_status,
  is_publicly_visible,
  can_receive_bookings,
  plan_type,
  max_specialists,
  max_receptionists,
  approved_at
FROM businesses
ORDER BY created_at DESC;

-- Ver triggers activos
SELECT 
  trigger_name,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_email_confirmed_activate_bookings';

-- ============================================
-- LÓGICA DE NEGOCIO
-- ============================================
-- 
-- Estado del negocio según confirmación + aprobación:
-- 
-- ┌─────────────────┬───────────────────┬─────────────────────────────────────┐
-- │ Email Confirmed │ Approval Status   │ Resultado                           │
-- ├─────────────────┼───────────────────┼─────────────────────────────────────┤
-- │ ❌ NO           │ pending           │ Solo configuración                  │
-- │                 │                   │ NO recibe reservas                  │
-- │                 │                   │ NO en búsquedas                     │
-- ├─────────────────┼───────────────────┼─────────────────────────────────────┤
-- │ ✅ SÍ           │ pending           │ Configuración completa              │
-- │                 │                   │ SÍ recibe reservas directas        │
-- │                 │                   │ NO en búsquedas públicas           │
-- ├─────────────────┼───────────────────┼─────────────────────────────────────┤
-- │ ✅ SÍ           │ approved          │ 100% funcional                      │
-- │                 │                   │ SÍ recibe reservas                  │
-- │                 │                   │ SÍ en búsquedas públicas           │
-- ├─────────────────┼───────────────────┼─────────────────────────────────────┤
-- │ ✅/❌           │ rejected          │ Sin acceso                          │
-- │                 │                   │ Ver rejection_reason                │
-- └─────────────────┴───────────────────┴─────────────────────────────────────┘
-- 
-- ============================================
