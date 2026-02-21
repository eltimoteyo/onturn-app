-- ============================================
-- OnTurn - Fix RLS Policies para Registro Inmediato
-- ============================================
-- Este script ajusta las políticas RLS para permitir
-- el flujo de acceso inmediato sin bloqueos
-- ============================================

-- 1. Verificar si profiles permite INSERT a usuarios recién creados
-- PROBLEMA: RLS puede bloquear INSERT si el usuario no está confirmado

-- Eliminar política restrictiva si existe
DROP POLICY IF EXISTS "Los usuarios pueden insertar su propio perfil" ON profiles;

-- Crear política que permite a CUALQUIER usuario autenticado crear su perfil
CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Permitir a usuarios leer su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON profiles;

CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Permitir a usuarios actualizar su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON profiles;

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Policies para businesses (permitir crear inmediatamente)
DROP POLICY IF EXISTS "Los dueños pueden crear su negocio" ON businesses;

CREATE POLICY "Los dueños pueden crear su negocio"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Los dueños pueden ver sus negocios" ON businesses;

CREATE POLICY "Los dueños pueden ver sus negocios"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR
    is_publicly_visible = true
  );

DROP POLICY IF EXISTS "Los dueños pueden actualizar sus negocios" ON businesses;

CREATE POLICY "Los dueños pueden actualizar sus negocios"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 5. Policies para tenant_registration_requests
DROP POLICY IF EXISTS "Los usuarios pueden crear su solicitud" ON tenant_registration_requests;

CREATE POLICY "Los usuarios pueden crear su solicitud"
  ON tenant_registration_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_user_id);

DROP POLICY IF EXISTS "Los usuarios pueden ver su solicitud" ON tenant_registration_requests;

CREATE POLICY "Los usuarios pueden ver su solicitud"
  ON tenant_registration_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = applicant_user_id);

-- 6. IMPORTANTE: Verificar que Supabase Auth permita signups
-- Esto se configura en Supabase Dashboard > Authentication > Settings
-- "Enable email confirmations" debe estar en ON
-- "Enable email signups" debe estar en ON

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todas las policies de profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'businesses', 'tenant_registration_requests')
ORDER BY tablename, policyname;

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- 
-- Si el error persiste después de ejecutar este script:
-- 
-- 1. Verificar en Supabase Dashboard:
--    Authentication > Settings > Enable email signups = ON
-- 
-- 2. Verificar password strength:
--    Mínimo 6 caracteres
-- 
-- 3. Verificar formato de email:
--    Debe ser email válido (user@domain.com)
-- 
-- 4. Verificar rate limiting:
--    Supabase limita a ~4 signups/min por IP
-- 
-- 5. Revisar logs de Supabase:
--    Database > Logs (filtrar por errores)
-- 
-- ============================================
