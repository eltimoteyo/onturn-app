-- =====================================================
-- AGREGAR COLUMNAS DE IMÁGENES A LAS TABLAS
-- =====================================================
-- Este script agrega las columnas necesarias para almacenar
-- las URLs de las imágenes subidas a Supabase Storage
-- =====================================================

-- Agregar columna de avatar a la tabla profiles (si no existe)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN profiles.avatar_url IS 'URL del avatar del usuario en Supabase Storage';

-- Agregar columna de logo a la tabla businesses (si no existe)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN businesses.logo_url IS 'URL del logo del negocio en Supabase Storage';

-- Agregar columna de imagen de portada a businesses (opcional)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

COMMENT ON COLUMN businesses.cover_image_url IS 'URL de imagen de portada del negocio';

-- Agregar columna de avatar a la tabla specialists (si no existe)
-- Nota: La columna 'avatar' ya existe, verificamos si necesitamos renombrarla
DO $$ 
BEGIN
  -- Si existe la columna 'avatar' de tipo TEXT, la renombramos a avatar_url
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'specialists' 
    AND column_name = 'avatar'
    AND data_type = 'text'
  ) THEN
    -- Si no existe avatar_url, renombramos
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'specialists' 
      AND column_name = 'avatar_url'
    ) THEN
      ALTER TABLE specialists RENAME COLUMN avatar TO avatar_url;
    END IF;
  ELSE
    -- Si no existe ninguna columna de avatar, la creamos
    ALTER TABLE specialists ADD COLUMN IF NOT EXISTS avatar_url TEXT;
  END IF;
END $$;

COMMENT ON COLUMN specialists.avatar_url IS 'URL del avatar del especialista en Supabase Storage';

-- Agregar índices para mejorar el rendimiento de búsqueda
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_logo_url ON businesses(logo_url) WHERE logo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_specialists_avatar_url ON specialists(avatar_url) WHERE avatar_url IS NOT NULL;

-- Verificar las columnas creadas
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('profiles', 'businesses', 'specialists')
  AND column_name LIKE '%url%'
ORDER BY table_name, column_name;

-- =====================================================
-- ✅ COLUMNAS DE IMÁGENES AGREGADAS
-- =====================================================
