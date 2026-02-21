-- ============================================
-- OnTurn - Sistema de Aprobación de Negocios
-- ============================================
-- Este script agrega campos para el nuevo flujo:
-- 1. Registro inmediato del negocio
-- 2. Acceso limitado hasta aprobación
-- 3. Sistema de planes
-- ============================================

-- 1. Agregar campos de aprobación a businesses
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
ADD COLUMN IF NOT EXISTS max_specialists INTEGER DEFAULT 1; -- Free: 1 especialista

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS max_receptionists INTEGER DEFAULT 0; -- Free: 0 recepcionistas

-- 3. Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_businesses_approval_status ON businesses(approval_status);
CREATE INDEX IF NOT EXISTS idx_businesses_publicly_visible ON businesses(is_publicly_visible);
CREATE INDEX IF NOT EXISTS idx_businesses_plan_type ON businesses(plan_type);

-- 4. Actualizar negocios existentes (marcarlos como aprobados)
UPDATE businesses 
SET approval_status = 'approved',
    is_publicly_visible = true,
    approved_at = created_at
WHERE approval_status IS NULL OR approval_status = 'pending';

-- 5. Crear función para verificar límites del plan
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
  -- Obtener plan y límites del negocio
  SELECT plan_type, max_specialists, max_receptionists
  INTO business_plan, max_specialists_allowed, max_receptionists_allowed
  FROM businesses
  WHERE id = business_uuid;

  -- Contar usuarios actuales
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

  -- Verificar límites según tipo de usuario
  IF user_type = 'specialist' THEN
    RETURN current_specialists < max_specialists_allowed;
  ELSIF user_type = 'receptionist' THEN
    RETURN current_receptionists < max_receptionists_allowed;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Comentarios descriptivos
COMMENT ON COLUMN businesses.approval_status IS 'Estado de aprobación: pending, approved, rejected';
COMMENT ON COLUMN businesses.is_publicly_visible IS 'Si el negocio aparece en búsquedas públicas (solo si está aprobado)';
COMMENT ON COLUMN businesses.plan_type IS 'Plan de suscripción: free (1 usuario), basic, pro, enterprise';
COMMENT ON COLUMN businesses.max_specialists IS 'Máximo de especialistas permitidos según el plan';
COMMENT ON COLUMN businesses.max_receptionists IS 'Máximo de recepcionistas permitidos según el plan';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver configuración de todos los negocios
SELECT 
  name,
  approval_status,
  is_publicly_visible,
  plan_type,
  max_specialists,
  max_receptionists,
  approved_at
FROM businesses
ORDER BY created_at DESC;

-- Ver límites de planes
SELECT 
  plan_type,
  COUNT(*) as negocios,
  AVG(max_specialists) as avg_specialists,
  AVG(max_receptionists) as avg_receptionists
FROM businesses
GROUP BY plan_type;

-- ============================================
-- PLANES SUGERIDOS
-- ============================================
-- 
-- FREE (Gratis):
--   - 1 especialista (el dueño)
--   - 0 recepcionistas
--   - No aparece en búsquedas hasta aprobación
--   - Configuración básica permitida
-- 
-- BASIC ($19/mes):
--   - 3 especialistas
--   - 1 recepcionista
--   - Aparece en búsquedas (después de aprobación)
--   - Todas las funcionalidades
-- 
-- PRO ($49/mes):
--   - 10 especialistas
--   - 3 recepcionistas
--   - Prioridad en búsquedas
--   - Estadísticas avanzadas
-- 
-- ENTERPRISE (Personalizado):
--   - Especialistas ilimitados
--   - Recepcionistas ilimitados
--   - API access
--   - Soporte dedicado
-- 
-- ============================================
