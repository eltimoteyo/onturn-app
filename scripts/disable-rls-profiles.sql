-- DESACTIVAR RLS en la tabla profiles
-- Esto es necesario si las políticas de seguridad están causando bloqueos o timeouts en las consultas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
