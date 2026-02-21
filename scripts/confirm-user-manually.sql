-- =====================================================
-- CONFIRMAR EMAIL MANUALMENTE (SOLO TESTING)
-- =====================================================
-- Esto marca el email como confirmado sin necesidad de click en link

-- Ver usuarios sin confirmar
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;

-- =====================================================
-- CONFIRMAR UN USUARIO ESPECÍFICO
-- =====================================================
-- Reemplaza el email con el que quieres confirmar:

/*
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'tu-email@ejemplo.com';
*/

-- =====================================================
-- CONFIRMAR TODOS LOS USUARIOS DE PRUEBA
-- =====================================================
-- Útil para testing rápido:

/*
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE 
  email LIKE '%test%' 
  OR email LIKE '%prueba%'
  OR email LIKE '%demo%';
*/

-- =====================================================
-- VERIFICAR CONFIRMACIÓN
-- =====================================================

/*
SELECT 
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '⏳ Pendiente'
  END as estado
FROM auth.users
WHERE email LIKE '%test%'
ORDER BY created_at DESC;
*/
