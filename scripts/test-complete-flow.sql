-- =====================================================
-- SCRIPT TODO-EN-UNO PARA TESTING
-- =====================================================
-- Limpia usuarios de prueba, deja solo el super admin

-- 1. VER usuarios actuales (para revisar primero)
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.email_confirmed_at,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. ELIMINAR usuarios de prueba (MANTENER super admin)
-- Descomenta para ejecutar:

/*
DELETE FROM auth.users
WHERE email NOT IN ('super@createam.cloud')
  AND (
    email LIKE '%test%' 
    OR email LIKE '%prueba%'
    OR email LIKE '%demo%'
    OR email LIKE '%@laciu.com%' -- emails temporales
    OR email LIKE '%@gufum.com%'
    OR created_at > NOW() - INTERVAL '1 hour' -- usuarios de la última hora
  );
*/

-- 3. VERIFICAR que solo quedó el super admin
/*
SELECT COUNT(*) as total_usuarios FROM auth.users;
SELECT email FROM auth.users ORDER BY created_at;
*/