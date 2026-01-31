# Instrucciones para Insertar Datos de Prueba

## Pasos para Ejecutar el Script de Datos de Prueba

1. **Asegúrate de haber ejecutado primero `setup-database.sql`**
   - El script de datos de prueba requiere que las tablas y categorías ya existan

2. **Crea un usuario de prueba (OBLIGATORIO antes de ejecutar insert-test-businesses.sql)**
   
   **⚠️ IMPORTANTE**: El script de datos de prueba necesita un usuario existente para asignar como `owner_id` de los establecimientos.
   
   **Opción A: Desde la aplicación (MÁS FÁCIL)**
   - Ve a `/admin/login?register=true`
   - Regístrate con:
     - **Email**: `test-business@onturn.com`
     - **Contraseña**: `Test123456`
     - **Nombre**: Usuario de Prueba
   - Esto creará automáticamente el usuario y perfil con rol `business_owner`
   
   **Opción B: Script SQL (requiere permisos de admin)**
   - Ejecuta el script `scripts/create-test-user.sql` en Supabase SQL Editor
   - Este script crea el usuario y perfil automáticamente
   
   **Opción C: Desde Supabase Dashboard**
   - Ve a Supabase Dashboard → Authentication → Users
   - Haz clic en "Add User" → "Create new user"
   - Email: `test-business@onturn.com`
   - Password: `Test123456`
   - ✅ Marca "Auto Confirm User"
   - Luego ejecuta este SQL para crear el perfil:
   ```sql
   INSERT INTO profiles (id, full_name, role, created_at, updated_at)
   SELECT id, 'Usuario de Prueba', 'business_owner', NOW(), NOW()
   FROM auth.users WHERE email = 'test-business@onturn.com'
   ON CONFLICT (id) DO UPDATE
   SET full_name = 'Usuario de Prueba',
       role = 'business_owner',
       updated_at = NOW();
   ```
   
   **Verificar que el usuario funciona:**
   - Ve a `/admin/login`
   - Intenta iniciar sesión con `test-business@onturn.com` / `Test123456`
   - Si funciona, continúa con el paso 3

3. **Ejecuta el script de datos de prueba**
   - Ve a Supabase Dashboard → SQL Editor
   - Abre el archivo `scripts/insert-test-businesses.sql`
   - Copia todo el contenido
   - Pégalo en el editor SQL
   - Haz clic en "Run"

4. **Verifica los datos insertados**
   - Ve a "Table Editor" → `businesses`
   - Deberías ver 8 establecimientos:
     - Barbería Kings
     - Padel Center Pro
     - Clínica San Borja
     - Legal Advisors
     - Spa Sentidos
     - Gimnasio PowerFit
     - Dentista Sonrisa Perfecta
     - Estudio Jurídico & Asociados

## Establecimientos Incluidos

### Belleza
- **Barbería Kings** - Cortes clásicos y barba
- **Spa Sentidos** - Masajes y tratamientos faciales

### Deporte
- **Padel Center Pro** - Canchas de pádel profesionales
- **Gimnasio PowerFit** - Gimnasio moderno con entrenadores

### Salud
- **Clínica San Borja** - Clínica médica 24 horas
- **Dentista Sonrisa Perfecta** - Clínica dental especializada

### Legal
- **Legal Advisors** - Consultoría legal y notarial
- **Estudio Jurídico & Asociados** - Bufete de abogados

## Datos Incluidos

Cada establecimiento incluye:
- ✅ Información completa (nombre, descripción, dirección, contacto)
- ✅ Imágenes de ejemplo (URLs de Unsplash)
- ✅ Ratings y reviews
- ✅ Horarios de atención configurados
- ✅ Especialistas (para algunos negocios)
- ✅ Configuración de slots y reservas

## Personalizar los Datos

Si quieres modificar los datos de prueba:

1. **Cambiar el owner_id**: 
   - Reemplaza `test_owner_id` en el script con un UUID específico de tu usuario

2. **Agregar más establecimientos**:
   - Copia el bloque `INSERT INTO businesses` y modifica los valores

3. **Modificar horarios**:
   - Edita los bloques `INSERT INTO business_hours` según tus necesidades

4. **Agregar más especialistas**:
   - Usa el patrón de los especialistas existentes para agregar más

## Solución de Problemas

### Error: "relation auth.users does not exist"
- Asegúrate de estar ejecutando el script en Supabase (no en PostgreSQL local)
- Verifica que tienes acceso a la tabla `auth.users`

### Error: "no existe el usuario"
- Crea primero un usuario desde la aplicación o usando la Opción B arriba

### Error: "violates foreign key constraint"
- Verifica que las categorías existen ejecutando:
  ```sql
  SELECT * FROM categories;
  ```
- Si no hay categorías, ejecuta primero `setup-database.sql`

### Los establecimientos no aparecen en la aplicación
- Verifica que `is_active = true` en la tabla `businesses`
- Revisa las políticas RLS (Row Level Security) en Supabase
- Asegúrate de que las categorías tienen los slugs correctos

## Próximos Pasos

Después de insertar los datos de prueba:
1. Ve a `/reservas` - deberías ver los 8 establecimientos
2. Haz clic en cualquier establecimiento para ver su detalle
3. Prueba crear una reserva
4. Inicia sesión como admin para gestionar las reservas
