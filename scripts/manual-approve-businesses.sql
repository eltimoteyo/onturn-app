-- SOLUCIÓN TEMPORAL: Actualizar manualmente el negocio a aprobado
-- Ejecuta esto para aprobar TODOS los negocios pendientes
UPDATE businesses 
SET 
    approval_status = 'approved',
    is_publicly_visible = true,
    can_receive_bookings = true
WHERE approval_status = 'pending';

-- Ver el resultado
SELECT 
    id, 
    name, 
    owner_id,
    approval_status, 
    is_publicly_visible, 
    can_receive_bookings,
    created_at
FROM businesses
ORDER BY created_at DESC
LIMIT 5;
