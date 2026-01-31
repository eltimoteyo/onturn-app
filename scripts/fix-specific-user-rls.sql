-- Script de diagnóstico y corrección para el usuario colgado
-- UUID Proporcionado: a1a69606-6c23-4482-ba24-7ce8224840cc

-- 1. Forzar la existencia del perfil con rol admin
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
VALUES (
  'a1a69606-6c23-4482-ba24-7ce8224840cc', 
  'Super Admin', 
  'admin', 
  NOW(), 
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  updated_at = NOW();

-- 2. DESACTIVAR RLS en la tabla profiles TEMPORALMENTE
-- Esto confirmará si el problema es una política de seguridad recursiva (causa común de "hangs")
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Imprimir confirmación
DO $$
BEGIN
  RAISE NOTICE 'Perfil forzado para ID a1a69606-6c23-4482-ba24-7ce8224840cc';
  RAISE NOTICE 'Row Level Security (RLS) desactivado en tabla profiles para prueba.';
END $$;
