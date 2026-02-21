-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE PARA ONTURN
-- =====================================================
-- Ejecuta este script en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query > Pega este código > Run
-- =====================================================

-- =====================================================
-- 1. CREAR BUCKETS (Contenedores de archivos)
-- =====================================================

-- Bucket para avatares de usuarios y especialistas (PÚBLICO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para logos de negocios (PÚBLICO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-logos',
  'business-logos',
  true,
  3145728, -- 3 MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket para documentos privados (recetas, informes médicos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- PRIVADO
  5242880, -- 5 MB en bytes
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- 2. POLÍTICAS DE ACCESO - BUCKET: avatars
-- =====================================================

-- Cualquiera puede VER avatares (lectura pública)
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Usuarios autenticados pueden SUBIR avatares
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Usuarios pueden ACTUALIZAR sus propios avatares
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Usuarios pueden ELIMINAR sus propios avatares
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);


-- =====================================================
-- 3. POLÍTICAS DE ACCESO - BUCKET: business-logos
-- =====================================================

-- Cualquiera puede VER logos de negocios (lectura pública)
CREATE POLICY "Public can view business logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-logos');

-- Business owners pueden SUBIR logos
CREATE POLICY "Business owners can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('business_owner', 'admin')
  )
);

-- Business owners pueden ACTUALIZAR logos de sus negocios
CREATE POLICY "Business owners can update own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('business_owner', 'admin')
  )
)
WITH CHECK (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('business_owner', 'admin')
  )
);

-- Business owners pueden ELIMINAR logos de sus negocios
CREATE POLICY "Business owners can delete own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('business_owner', 'admin')
  )
);


-- =====================================================
-- 4. POLÍTICAS DE ACCESO - BUCKET: documents (PRIVADO)
-- =====================================================

-- Solo el dueño puede VER sus documentos
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Solo usuarios autenticados pueden SUBIR documentos
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Solo el dueño puede ACTUALIZAR sus documentos
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Solo el dueño puede ELIMINAR sus documentos
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);


-- =====================================================
-- 5. VERIFICACIÓN DE CONFIGURACIÓN
-- =====================================================

-- Ver buckets creados
SELECT * FROM storage.buckets ORDER BY created_at DESC;

-- Ver políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;


-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
-- Ahora puedes usar Supabase Storage en tu aplicación
-- Los buckets están creados y configurados con sus políticas
-- =====================================================
