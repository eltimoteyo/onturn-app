-- Crear política RLS para permitir que los SUPER ADMINS actualicen cualquier negocio
-- Esto es necesario para que el flujo de aprobación funcione

-- Primero, eliminar la política si ya existe
DROP POLICY IF EXISTS "Super admins can update any business" ON businesses;

-- Crear la política para que super admins puedan UPDATE
CREATE POLICY "Super admins can update any business"
ON businesses
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- También asegurar que los business owners puedan actualizar sus propios negocios
DROP POLICY IF EXISTS "Business owners can update their own business" ON businesses;

CREATE POLICY "Business owners can update their own business"
ON businesses
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Verificar las políticas creadas
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'businesses' 
AND cmd = 'UPDATE'
ORDER BY policyname;
