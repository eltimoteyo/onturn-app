-- =====================================================
-- LIMPIAR USUARIOS DE PRUEBA
-- =====================================================
-- Este script elimina usuarios de prueba para poder reutilizar los emails
-- ADVERTENCIA: Esto eliminará también sus negocios y reservas asociadas

-- Ver usuarios a eliminar (opcional, revisar primero)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE 
  email LIKE '%test%' 
  OR email LIKE '%prueba%'
  OR email LIKE '%demo%'
ORDER BY created_at DESC;

-- =====================================================
-- ELIMINAR USUARIOS DE PRUEBA
-- =====================================================
-- Descomenta las siguientes líneas para ejecutar la eliminación:

/*
DELETE FROM auth.users
WHERE 
  email LIKE '%test%' 
  OR email LIKE '%prueba%'
  OR email LIKE '%demo%';
*/

-- =====================================================
-- ALTERNATIVA: Eliminar UN usuario específico
-- =====================================================
-- Descomenta y reemplaza el email:

/*
DELETE FROM auth.users
WHERE email = 'tu-email-exacto@ejemplo.com';
*/

-- =====================================================
-- VERIFICAR ELIMINACIÓN
-- =====================================================
-- Revisar que se eliminaron correctamente:

/*
SELECT COUNT(*) as usuarios_restantes
FROM auth.users
WHERE email LIKE '%test%';
*/
