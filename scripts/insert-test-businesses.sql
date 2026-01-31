-- ============================================
-- OnTurn - Script para Insertar Establecimientos de Prueba
-- Ejecutar este script DESPUÉS de setup-database.sql
-- ============================================

-- NOTA: Necesitas tener al menos un usuario en auth.users para usar como owner_id
-- Si no tienes usuarios, primero crea uno desde la aplicación o ejecuta:
-- INSERT INTO auth.users (id, email, encrypted_password) VALUES 
--   (gen_random_uuid(), 'test@onturn.com', crypt('password123', gen_salt('bf')));

-- Obtener el primer usuario disponible como owner (o usar un UUID específico)
-- Si no hay usuarios, este script fallará. Asegúrate de tener usuarios primero.

-- Función auxiliar para obtener un owner_id (usa el primer usuario disponible)
DO $$
DECLARE
  test_owner_id UUID;
  salud_category_id UUID;
  belleza_category_id UUID;
  deporte_category_id UUID;
  legal_category_id UUID;
  business_record RECORD;
BEGIN
  -- Buscar el usuario de prueba específico
  SELECT id INTO test_owner_id 
  FROM auth.users 
  WHERE email = 'test-business@onturn.com' 
  LIMIT 1;
  
  -- Si no existe el usuario de prueba, intentar usar cualquier usuario disponible
  IF test_owner_id IS NULL THEN
    SELECT id INTO test_owner_id FROM auth.users LIMIT 1;
  END IF;
  
  -- Si aún no hay usuarios, mostrar error
  IF test_owner_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún usuario en auth.users. Por favor crea primero el usuario test-business@onturn.com usando uno de estos métodos: 1) Desde la app: /admin/login?register=true, 2) Ejecuta scripts/create-test-user.sql, 3) Desde Supabase Dashboard → Authentication → Users';
  END IF;
  
  -- Asegurar que el perfil existe para el usuario encontrado
  INSERT INTO profiles (id, full_name, role, created_at, updated_at)
  VALUES (test_owner_id, 'Usuario de Prueba', 'business_owner', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(profiles.full_name, 'Usuario de Prueba'),
      role = COALESCE(profiles.role, 'business_owner'),
      updated_at = NOW();

  -- Obtener IDs de categorías
  SELECT id INTO salud_category_id FROM categories WHERE slug = 'salud' LIMIT 1;
  SELECT id INTO belleza_category_id FROM categories WHERE slug = 'belleza' LIMIT 1;
  SELECT id INTO deporte_category_id FROM categories WHERE slug = 'deporte' LIMIT 1;
  SELECT id INTO legal_category_id FROM categories WHERE slug = 'legal' LIMIT 1;

  -- Si no existen las categorías, usar las del script setup-database.sql
  IF salud_category_id IS NULL THEN
    SELECT id INTO salud_category_id FROM categories WHERE name = 'Salud' LIMIT 1;
  END IF;
  IF belleza_category_id IS NULL THEN
    SELECT id INTO belleza_category_id FROM categories WHERE name = 'Belleza' LIMIT 1;
  END IF;
  IF deporte_category_id IS NULL THEN
    SELECT id INTO deporte_category_id FROM categories WHERE name = 'Deporte' LIMIT 1;
  END IF;
  IF legal_category_id IS NULL THEN
    SELECT id INTO legal_category_id FROM categories WHERE name = 'Legal' LIMIT 1;
  END IF;

  -- ============================================
  -- INSERTAR ESTABLECIMIENTOS DE PRUEBA
  -- ============================================

  -- 1. Barbería Kings (Belleza)
  INSERT INTO businesses (
    owner_id, name, slug, description, meta_description,
    category_id, address, city, state, zip_code,
    phone, email, website, logo, images,
    rating, total_reviews, is_active, auto_confirm
  ) VALUES (
    test_owner_id,
    'Barbería Kings',
    'barberia-kings',
    'Barbería moderna especializada en cortes clásicos, degradados y cuidado de barba. Ambiente acogedor con atención personalizada.',
    'Reserva tu corte en Barbería Kings. Especialistas en cortes clásicos, degradados y barba. Ubicados en Miraflores, Lima.',
    belleza_category_id,
    'Av. Larco 1020, Miraflores',
    'Lima',
    'Lima',
    '15074',
    '+51 987 654 321',
    'contacto@barberiakings.com',
    'https://barberiakings.com',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000',
    ARRAY[
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1000'
    ],
    4.8,
    120,
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- 2. Padel Center Pro (Deporte)
  INSERT INTO businesses (
    owner_id, name, slug, description, meta_description,
    category_id, address, city, state, zip_code,
    phone, email, website, logo, images,
    rating, total_reviews, is_active, auto_confirm
  ) VALUES (
    test_owner_id,
    'Padel Center Pro',
    'padel-center-pro',
    'Centro de pádel profesional con canchas de última generación. Clases particulares y torneos. Ideal para todos los niveles.',
    'Reserva tu cancha de pádel en Padel Center Pro. Canchas profesionales, clases particulares. Ubicado en Surco, Lima.',
    deporte_category_id,
    'Jockey Plaza, Surco',
    'Lima',
    'Lima',
    '15023',
    '+51 987 654 322',
    'info@padelcenterpro.com',
    'https://padelcenterpro.com',
    'https://images.unsplash.com/photo-1620021379930-b530c8845236?auto=format&fit=crop&q=80&w=1000',
    ARRAY[
      'https://images.unsplash.com/photo-1620021379930-b530c8845236?auto=format&fit=crop&q=80&w=1000'
    ],
    4.9,
    85,
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- 3. Clínica San Borja (Salud)
  INSERT INTO businesses (
    owner_id, name, slug, description, meta_description,
    category_id, address, city, state, zip_code,
    phone, email, website, logo, images,
    rating, total_reviews, is_active, auto_confirm
  ) VALUES (
    test_owner_id,
    'Clínica San Borja',
    'clinica-san-borja',
    'Clínica médica con atención 24 horas. Especialidades en cardiología, pediatría y odontología. Equipamiento moderno y profesionales certificados.',
    'Reserva tu cita médica en Clínica San Borja. Cardiología, pediatría, odontología. Atención 24 horas en San Borja, Lima.',
    salud_category_id,
    'Av. Guardia Civil 300, San Borja',
    'Lima',
    'Lima',
    '15036',
    '+51 987 654 323',
    'citas@clinicasanborja.com',
    'https://clinicasanborja.com',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
    ARRAY[
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000'
    ],
    4.7,
    310,
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- 4. Legal Advisors (Legal)
  INSERT INTO businesses (
    owner_id, name, slug, description, meta_description,
    category_id, address, city, state, zip_code,
    phone, email, website, logo, images,
    rating, total_reviews, is_active, auto_confirm
  ) VALUES (
    test_owner_id,
    'Legal Advisors',
    'legal-advisors',
    'Bufete de abogados especializado en consultoría legal y servicios notariales. Asesoría personalizada para empresas y particulares.',
    'Reserva tu consulta legal en Legal Advisors. Consultoría legal y servicios notariales. Ubicados en Centro Empresarial Real, Lima.',
    legal_category_id,
    'Centro Empresarial Real, San Isidro',
    'Lima',
    'Lima',
    '15027',
    '+51 987 654 324',
    'contacto@legaladvisors.com',
    'https://legaladvisors.com',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000',
    ARRAY[
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000'
    ],
    5.0,
    40,
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- 5. Spa Sentidos (Belleza)
  INSERT INTO businesses (
    id, owner_id, name, slug, description, meta_description,
    category_id, address, city, state, zip_code,
    phone, email, website, logo, images,
    rating, total_reviews, is_active, auto_confirm
  ) VALUES (
    gen_random_uuid(),
    test_owner_id,
    'Spa Sentidos',
    'spa-sentidos',
    'Spa de lujo con servicios de masajes relajantes, tratamientos faciales y sauna. Ambiente tranquilo para relajación y bienestar.',
    'Reserva tu sesión en Spa Sentidos. Masajes, faciales y sauna. Ubicado en San Isidro, Lima.',
    belleza_category_id,
    'Av. Las Begonias 1234, San Isidro',
    'Lima',
    'Lima',
    '15027',
    '+51 987 654 325',
    'reservas@spasentidos.com',
    'https://spasentidos.com',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=1000',
    ARRAY[
      'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=1000'
    ],
    4.9,
    215,
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- 6. Gimnasio PowerFit (Deporte)
  INSERT INTO businesses (
    owner_id, name, slug, description, meta_description,
    category_id, address, city, state, zip_code,
    phone, email, website, logo, images,
    rating, total_reviews, is_active, auto_confirm
  ) VALUES (
    test_owner_id,
    'Gimnasio PowerFit',
    'gimnasio-powerfit',
    'Gimnasio moderno con equipos de última generación. Entrenadores certificados, clases grupales y planes personalizados.',
    'Reserva tu entrenamiento en Gimnasio PowerFit. Equipos modernos, entrenadores certificados. Ubicado en Miraflores, Lima.',
    deporte_category_id,
    'Av. Benavides 2456, Miraflores',
    'Lima',
    'Lima',
    '15074',
    '+51 987 654 326',
    'info@powerfit.com',
    'https://powerfit.com',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000',
    ARRAY[
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000'
    ],
    4.6,
    180,
    true,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- 7. Dentista Sonrisa Perfecta (Salud)
  INSERT INTO businesses (
    id, owner_id, name, slug, description, meta_description,
    category_id, address, city, state, zip_code,
    phone, email, website, logo, images,
    rating, total_reviews, is_active, auto_confirm
  ) VALUES (
    gen_random_uuid(),
    test_owner_id,
    'Dentista Sonrisa Perfecta',
    'dentista-sonrisa-perfecta',
    'Clínica dental especializada en ortodoncia, implantes y estética dental. Tecnología avanzada y atención personalizada.',
    'Reserva tu cita dental en Sonrisa Perfecta. Ortodoncia, implantes y estética dental. Ubicado en Surco, Lima.',
    salud_category_id,
    'Av. Primavera 890, Surco',
    'Lima',
    'Lima',
    '15023',
    '+51 987 654 327',
    'citas@sonrisaperfecta.com',
    'https://sonrisaperfecta.com',
    'https://images.unsplash.com/photo-1606811971618-4486b54c18f2?auto=format&fit=crop&q=80&w=1000',
    ARRAY[
      'https://images.unsplash.com/photo-1606811971618-4486b54c18f2?auto=format&fit=crop&q=80&w=1000'
    ],
    4.8,
    95,
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- 8. Estudio Jurídico & Asociados (Legal)
  INSERT INTO businesses (
    owner_id, name, slug, description, meta_description,
    category_id, address, city, state, zip_code,
    phone, email, website, logo, images,
    rating, total_reviews, is_active, auto_confirm
  ) VALUES (
    test_owner_id,
    'Estudio Jurídico & Asociados',
    'estudio-juridico-asociados',
    'Bufete de abogados con amplia experiencia en derecho corporativo, laboral y civil. Asesoría legal integral para empresas.',
    'Reserva tu consulta en Estudio Jurídico & Asociados. Derecho corporativo, laboral y civil. Ubicado en San Isidro, Lima.',
    legal_category_id,
    'Av. Javier Prado Este 4200, San Isidro',
    'Lima',
    'Lima',
    '15027',
    '+51 987 654 328',
    'contacto@estudiojuridico.com',
    'https://estudiojuridico.com',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1000',
    ARRAY[
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1000'
    ],
    4.7,
    65,
    true,
    false
  ) ON CONFLICT (slug) DO NOTHING;

  -- ============================================
  -- INSERTAR HORARIOS DE ATENCIÓN
  -- ============================================

  -- Insertar horarios estándar (Lun-Vie: 9-18, Sáb: 9-13, Dom: Cerrado)
  FOR business_record IN SELECT id, name FROM businesses WHERE owner_id = test_owner_id LOOP
      -- Lunes a Viernes: 09:00 - 18:00
      FOR day_num IN 1..5 LOOP
        INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
        VALUES (business_record.id, day_num, '09:00', '18:00', false)
        ON CONFLICT (business_id, day_of_week) DO UPDATE SET
          open_time = EXCLUDED.open_time,
          close_time = EXCLUDED.close_time,
          is_closed = EXCLUDED.is_closed;
      END LOOP;
      
      -- Sábado: 09:00 - 13:00
      INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
      VALUES (business_record.id, 6, '09:00', '13:00', false)
      ON CONFLICT (business_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time,
        close_time = EXCLUDED.close_time,
        is_closed = EXCLUDED.is_closed;
      
      -- Domingo: Cerrado
      INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
      VALUES (business_record.id, 0, '00:00', '00:00', true)
      ON CONFLICT (business_id, day_of_week) DO UPDATE SET
        open_time = EXCLUDED.open_time,
        close_time = EXCLUDED.close_time,
        is_closed = EXCLUDED.is_closed;
    END LOOP;
    
    -- Horarios especiales para algunos negocios
    -- Clínica San Borja: 24 horas (todos los días)
    UPDATE business_hours 
    SET open_time = '00:00', close_time = '23:59', is_closed = false
    WHERE business_id IN (SELECT id FROM businesses WHERE slug = 'clinica-san-borja')
    AND day_of_week BETWEEN 0 AND 6;
    
    -- Padel Center Pro: Horario extendido
    UPDATE business_hours 
    SET open_time = '06:00', close_time = '23:00', is_closed = false
    WHERE business_id IN (SELECT id FROM businesses WHERE slug = 'padel-center-pro')
    AND day_of_week BETWEEN 1 AND 6;
    
    -- Spa Sentidos: Horario especial
    UPDATE business_hours 
    SET open_time = '10:00', close_time = '20:00', is_closed = false
    WHERE business_id IN (SELECT id FROM businesses WHERE slug = 'spa-sentidos')
    AND day_of_week BETWEEN 1 AND 6;

  -- ============================================
  -- INSERTAR ESPECIALISTAS DE PRUEBA
  -- ============================================

  -- Barbería Kings - Especialistas
  INSERT INTO specialists (business_id, name, specialty, email, phone, is_active)
  SELECT 
    b.id,
    'Carlos Mendoza',
    'Corte Clásico y Degradado',
    'carlos@barberiakings.com',
    '+51 987 111 111',
    true
  FROM businesses b
  WHERE b.slug = 'barberia-kings'
  AND NOT EXISTS (
    SELECT 1 FROM specialists s
    WHERE s.business_id = b.id
    AND s.name = 'Carlos Mendoza'
  );

  INSERT INTO specialists (business_id, name, specialty, email, phone, is_active)
  SELECT 
    b.id,
    'Miguel Torres',
    'Barba y Afeitado',
    'miguel@barberiakings.com',
    '+51 987 111 112',
    true
  FROM businesses b
  WHERE b.slug = 'barberia-kings'
  AND NOT EXISTS (
    SELECT 1 FROM specialists s
    WHERE s.business_id = b.id
    AND s.name = 'Miguel Torres'
  );

  -- Clínica San Borja - Especialistas
  INSERT INTO specialists (business_id, name, specialty, email, phone, is_active)
  SELECT 
    b.id,
    'Dr. Juan Pérez',
    'Cardiología',
    'jperez@clinicasanborja.com',
    '+51 987 222 111',
    true
  FROM businesses b
  WHERE b.slug = 'clinica-san-borja'
  AND NOT EXISTS (
    SELECT 1 FROM specialists s
    WHERE s.business_id = b.id
    AND s.name = 'Dr. Juan Pérez'
  );

  INSERT INTO specialists (business_id, name, specialty, email, phone, is_active)
  SELECT 
    b.id,
    'Dra. María González',
    'Pediatría',
    'mgonzalez@clinicasanborja.com',
    '+51 987 222 112',
    true
  FROM businesses b
  WHERE b.slug = 'clinica-san-borja'
  AND NOT EXISTS (
    SELECT 1 FROM specialists s
    WHERE s.business_id = b.id
    AND s.name = 'Dra. María González'
  );

  INSERT INTO specialists (business_id, name, specialty, email, phone, is_active)
  SELECT 
    b.id,
    'Dr. Luis Ramírez',
    'Odontología',
    'lramirez@clinicasanborja.com',
    '+51 987 222 113',
    true
  FROM businesses b
  WHERE b.slug = 'clinica-san-borja'
  AND NOT EXISTS (
    SELECT 1 FROM specialists s
    WHERE s.business_id = b.id
    AND s.name = 'Dr. Luis Ramírez'
  );

  -- ============================================
  -- INSERTAR CONFIGURACIÓN DE NEGOCIOS
  -- ============================================

  INSERT INTO business_settings (business_id, slot_duration, advance_booking_days, reminder_hours, auto_confirm)
  SELECT 
    id,
    30, -- 30 minutos por slot
    30, -- 30 días de anticipación
    24, -- Recordatorio 24 horas antes
    auto_confirm
  FROM businesses WHERE owner_id = test_owner_id
  ON CONFLICT (business_id) DO UPDATE SET
    slot_duration = EXCLUDED.slot_duration,
    advance_booking_days = EXCLUDED.advance_booking_days,
    reminder_hours = EXCLUDED.reminder_hours,
    auto_confirm = EXCLUDED.auto_confirm;

  RAISE NOTICE 'Establecimientos de prueba insertados correctamente. Total: %', (SELECT COUNT(*) FROM businesses WHERE owner_id = test_owner_id);
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que se insertaron correctamente
SELECT 
  b.name,
  b.slug,
  c.name as categoria,
  b.rating,
  b.total_reviews,
  COUNT(DISTINCT s.id) as especialistas,
  COUNT(DISTINCT bh.id) as dias_horario
FROM businesses b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN specialists s ON s.business_id = b.id
LEFT JOIN business_hours bh ON bh.business_id = b.id
WHERE b.is_active = true
GROUP BY b.id, b.name, b.slug, c.name, b.rating, b.total_reviews
ORDER BY b.name;
