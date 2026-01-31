-- ============================================
-- OnTurn - Script de Configuración de Base de Datos (IDEMPOTENTE)
-- Ejecutar este script en Supabase SQL Editor
-- Puede ejecutarse múltiples veces sin errores
-- ============================================

-- ============================================
-- EXTENSIONES
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- Tipo de rol de usuario
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'business_owner', 'admin', 'specialist', 'receptionist');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Agregar 'specialist' al enum si no existe (migración para bases de datos existentes)
-- Verificamos si el valor existe antes de intentar usarlo
DO $$ 
DECLARE
  value_exists BOOLEAN;
BEGIN
  -- Verificar si el enum user_role existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Verificar si 'specialist' ya existe en el enum
    SELECT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role' 
      AND e.enumlabel = 'specialist'
    ) INTO value_exists;
    
    -- Si no existe, mostrar advertencia
    -- NOTA: ALTER TYPE ADD VALUE no puede ejecutarse dentro de un bloque DO en PostgreSQL
    -- El usuario debe ejecutarlo manualmente si el enum ya existe sin 'specialist'
    IF NOT value_exists THEN
      RAISE NOTICE 'ADVERTENCIA: El enum user_role existe pero no tiene el valor ''specialist''.';
      RAISE NOTICE 'Ejecuta esto manualmente antes de continuar: ALTER TYPE user_role ADD VALUE ''specialist'';';
      RAISE NOTICE 'Luego vuelve a ejecutar este script.';
    END IF;
  END IF;
EXCEPTION 
  WHEN OTHERS THEN 
    -- Si hay algún error en la verificación, continuar (el enum puede no existir aún)
    NULL;
END $$;

-- Agregar 'receptionist' al enum si no existe
DO $$ 
DECLARE
  value_exists BOOLEAN;
BEGIN
  -- Verificar si el enum user_role existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Verificar si 'receptionist' ya existe en el enum
    SELECT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role' 
      AND e.enumlabel = 'receptionist'
    ) INTO value_exists;
    
    -- Si no existe, mostrar advertencia
    IF NOT value_exists THEN
      RAISE NOTICE 'ADVERTENCIA: El enum user_role existe pero no tiene el valor ''receptionist''.';
      RAISE NOTICE 'Ejecuta esto manualmente antes de continuar: ALTER TYPE user_role ADD VALUE ''receptionist'';';
      RAISE NOTICE 'Luego vuelve a ejecutar este script.';
    END IF;
  END IF;
EXCEPTION 
  WHEN OTHERS THEN 
    NULL;
END $$;

-- Estado de solicitud de registro
DO $$ BEGIN
  CREATE TYPE registration_request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Estado de reserva
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLAS
-- ============================================

-- 1. CATEGORIES (Categorías de negocios)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TENANT_REGISTRATION_REQUESTS (Solicitudes de registro de tenants)
CREATE TABLE IF NOT EXISTS tenant_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_email TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  business_address TEXT,
  business_city TEXT,
  business_state TEXT,
  business_phone TEXT,
  business_email TEXT,
  status registration_request_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUSINESSES (Negocios/Establecimientos = Tenants)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_request_id UUID REFERENCES tenant_registration_requests(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  meta_description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  email TEXT,
  website TEXT,
  logo TEXT,
  images TEXT[],
  auto_confirm BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  max_users INTEGER DEFAULT 5, -- Límite de usuarios del tenant configurado por Admin General
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  price_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BUSINESS_HOURS (Horarios de atención)
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, day_of_week)
);

-- 5. SPECIALTIES (Especialidades del tenant)
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER DEFAULT 30, -- Duración en minutos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, name)
);

-- 6. SPECIALISTS (Especialistas)
CREATE TABLE IF NOT EXISTS specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialty TEXT, -- Campo legacy, mantener por compatibilidad
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columna specialty_id si no existe (migración)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'specialists' AND column_name = 'specialty_id'
  ) THEN
    ALTER TABLE specialists ADD COLUMN specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. APPOINTMENTS (Reservas/Turnos)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES specialists(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  result TEXT,
  result_notes TEXT,
  prescription TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BUSINESS_SETTINGS (Configuración del negocio)
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
  slot_duration INTEGER DEFAULT 30,
  advance_booking_days INTEGER DEFAULT 30,
  reminder_hours INTEGER DEFAULT 24,
  auto_confirm BOOLEAN DEFAULT false,
  require_phone BOOLEAN DEFAULT true,
  require_email BOOLEAN DEFAULT true,
  cancellation_hours INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TENANT_USERS (Usuarios asociados a un tenant)
-- Nota: Si el enum user_role no tiene 'specialist', esta tabla fallará al crearse
-- Ejecuta primero: ALTER TYPE user_role ADD VALUE 'specialist';
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'customer', -- Usar 'customer' como default temporal, se actualizará después
  specialty_id UUID REFERENCES specialties(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Cambiar el default a 'specialist' si el valor existe en el enum
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' 
    AND e.enumlabel = 'specialist'
  ) THEN
    ALTER TABLE tenant_users ALTER COLUMN role SET DEFAULT 'specialist';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 10. PROFILES (Perfiles de usuario extendido)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar TEXT,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NOTIFICATIONS (Suscripciones push)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'business')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES (Idempotente - solo crea si la tabla existe)
-- ============================================

-- Índices para businesses
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
    CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category_id);
    CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
    CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);
    CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
    CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
    CREATE INDEX IF NOT EXISTS idx_businesses_city_category ON businesses(city, category_id);
    CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(meta_description, '')));
  END IF;
END $$;

-- Índices para appointments
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    CREATE INDEX IF NOT EXISTS idx_appointments_business ON appointments(business_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON appointments(appointment_date, appointment_time);
  END IF;
END $$;

-- Índices para specialties
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties') THEN
    CREATE INDEX IF NOT EXISTS idx_specialties_business ON specialties(business_id);
  END IF;
END $$;

-- Índices para specialists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialists') THEN
    CREATE INDEX IF NOT EXISTS idx_specialists_business ON specialists(business_id);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'specialists' AND column_name = 'specialty_id'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_specialists_specialty ON specialists(specialty_id);
    END IF;
  END IF;
END $$;

-- Índices para tenant_users
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_users') THEN
    CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON tenant_users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON tenant_users(user_id);
  END IF;
END $$;

-- Índices para tenant_registration_requests
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_registration_requests') THEN
    CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON tenant_registration_requests(status);
    CREATE INDEX IF NOT EXISTS idx_registration_requests_applicant ON tenant_registration_requests(applicant_user_id);
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas (idempotente)
DO $$ 
BEGIN
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE tenant_registration_requests ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================
-- POLÍTICAS RLS (Eliminar existentes primero)
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Admin can view all registration requests" ON tenant_registration_requests;
DROP POLICY IF EXISTS "Users can view their own registration requests" ON tenant_registration_requests;
DROP POLICY IF EXISTS "Anyone can create registration requests" ON tenant_registration_requests;
DROP POLICY IF EXISTS "Admin can update registration requests" ON tenant_registration_requests;
DROP POLICY IF EXISTS "Businesses are viewable by everyone" ON businesses;
DROP POLICY IF EXISTS "Tenant users are viewable by tenant admin" ON tenant_users;
DROP POLICY IF EXISTS "Tenant admin can manage tenant users" ON tenant_users;
DROP POLICY IF EXISTS "Business owners can insert their own businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can update their own businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can delete their own businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can view their businesses" ON businesses;
DROP POLICY IF EXISTS "Business hours are viewable by everyone" ON business_hours;
DROP POLICY IF EXISTS "Business owners can manage their business hours" ON business_hours;
DROP POLICY IF EXISTS "Specialties are viewable by everyone" ON specialties;
DROP POLICY IF EXISTS "Business owners can manage their specialties" ON specialties;
DROP POLICY IF EXISTS "Specialists are viewable by everyone" ON specialists;
DROP POLICY IF EXISTS "Business owners can manage their specialists" ON specialists;
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Business owners can update appointments" ON appointments;
DROP POLICY IF EXISTS "Users can cancel their own appointments" ON appointments;
DROP POLICY IF EXISTS "Business settings are viewable by everyone" ON business_settings;
DROP POLICY IF EXISTS "Business owners can manage their settings" ON business_settings;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON notifications;

-- Políticas para CATEGORIES (lectura pública)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE POLICY "Categories are viewable by everyone" ON categories
      FOR SELECT USING (true);
  END IF;
END $$;

-- Políticas para TENANT_REGISTRATION_REQUESTS
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_registration_requests') THEN
    CREATE POLICY "Admin can view all registration requests" ON tenant_registration_requests
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );

    CREATE POLICY "Users can view their own registration requests" ON tenant_registration_requests
      FOR SELECT USING (applicant_user_id = auth.uid());

    CREATE POLICY "Anyone can create registration requests" ON tenant_registration_requests
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "Admin can update registration requests" ON tenant_registration_requests
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- Políticas para TENANT_USERS
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_users') THEN
    CREATE POLICY "Tenant users are viewable by tenant admin" ON tenant_users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = tenant_users.tenant_id 
          AND businesses.owner_id = auth.uid()
        )
      );

    CREATE POLICY "Tenant admin can manage tenant users" ON tenant_users
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = tenant_users.tenant_id 
          AND businesses.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Políticas para BUSINESSES (lectura pública, escritura solo para owners)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
    CREATE POLICY "Businesses are viewable by everyone" ON businesses
      FOR SELECT USING (is_active = true);

    CREATE POLICY "Business owners can view their businesses" ON businesses
      FOR SELECT USING (auth.uid() = owner_id);

    CREATE POLICY "Business owners can insert their own businesses" ON businesses
      FOR INSERT WITH CHECK (auth.uid() = owner_id);

    CREATE POLICY "Business owners can update their own businesses" ON businesses
      FOR UPDATE USING (auth.uid() = owner_id);

    CREATE POLICY "Business owners can delete their own businesses" ON businesses
      FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

-- Políticas para BUSINESS_HOURS
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_hours') THEN
    CREATE POLICY "Business hours are viewable by everyone" ON business_hours
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = business_hours.business_id 
          AND businesses.is_active = true
        )
      );

    CREATE POLICY "Business owners can manage their business hours" ON business_hours
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = business_hours.business_id 
          AND businesses.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Políticas para SPECIALTIES
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties') THEN
    CREATE POLICY "Specialties are viewable by everyone" ON specialties
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = specialties.business_id 
          AND businesses.is_active = true
        )
      );

    CREATE POLICY "Business owners can manage their specialties" ON specialties
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = specialties.business_id 
          AND businesses.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Políticas para SPECIALISTS
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialists') THEN
    CREATE POLICY "Specialists are viewable by everyone" ON specialists
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = specialists.business_id 
          AND businesses.is_active = true
        )
      );

    CREATE POLICY "Business owners can manage their specialists" ON specialists
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = specialists.business_id 
          AND businesses.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Políticas para APPOINTMENTS
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    CREATE POLICY "Users can view their own appointments" ON appointments
      FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = appointments.business_id 
          AND businesses.owner_id = auth.uid()
        )
      );

    CREATE POLICY "Anyone can create appointments" ON appointments
      FOR INSERT WITH CHECK (true);

    CREATE POLICY "Business owners can update appointments" ON appointments
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = appointments.business_id 
          AND businesses.owner_id = auth.uid()
        )
      );

    CREATE POLICY "Users can cancel their own appointments" ON appointments
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Políticas para BUSINESS_SETTINGS
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_settings') THEN
    CREATE POLICY "Business settings are viewable by everyone" ON business_settings
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = business_settings.business_id 
          AND businesses.is_active = true
        )
      );

    CREATE POLICY "Business owners can manage their settings" ON business_settings
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM businesses 
          WHERE businesses.id = business_settings.business_id 
          AND businesses.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Políticas para PROFILES
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE POLICY "Profiles are viewable by everyone" ON profiles
      FOR SELECT USING (true);

    CREATE POLICY "Users can update their own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Users can insert their own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Políticas para NOTIFICATIONS
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    CREATE POLICY "Users can manage their own notifications" ON notifications
      FOR ALL USING (user_id = auth.uid()::text OR user_id LIKE auth.uid()::text || '%');
  END IF;
END $$;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Eliminar triggers existentes si existen
-- Eliminar triggers existentes si existen (solo si la tabla existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_registration_requests') THEN
    DROP TRIGGER IF EXISTS update_registration_requests_updated_at ON tenant_registration_requests;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
    DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_users') THEN
    DROP TRIGGER IF EXISTS update_tenant_users_updated_at ON tenant_users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_settings') THEN
    DROP TRIGGER IF EXISTS update_business_settings_updated_at ON business_settings;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties') THEN
    DROP TRIGGER IF EXISTS update_specialties_updated_at ON specialties;
  END IF;
END $$;

-- Crear triggers para updated_at (solo si la tabla existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_registration_requests') THEN
    CREATE TRIGGER update_registration_requests_updated_at BEFORE UPDATE ON tenant_registration_requests
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'specialties') THEN
    CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON specialties
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'businesses') THEN
    CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant_users') THEN
    CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_settings') THEN
    CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- DATOS INICIALES (Categorías de ejemplo)
-- ============================================

INSERT INTO categories (name, slug, icon, description, color) VALUES
  ('Salud', 'salud', 'Stethoscope', 'Clínicas, hospitales y servicios médicos', '#00A896'),
  ('Belleza', 'belleza', 'Scissors', 'Barberías, peluquerías y salones de belleza', '#FF6B9D'),
  ('Deporte', 'deporte', 'Dumbbell', 'Gimnasios, entrenadores y actividades deportivas', '#4ECDC4'),
  ('Legal', 'legal', 'Briefcase', 'Abogados y servicios legales', '#95A5A6'),
  ('Educación', 'educacion', 'BookOpen', 'Tutores, cursos y servicios educativos', '#3498DB'),
  ('Veterinaria', 'veterinaria', 'Heart', 'Veterinarias y servicios para mascotas', '#E74C3C'),
  ('Automotriz', 'automotriz', 'Car', 'Talleres mecánicos y servicios automotrices', '#F39C12'),
  ('Hogar', 'hogar', 'Home', 'Servicios para el hogar y reparaciones', '#9B59B6')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
