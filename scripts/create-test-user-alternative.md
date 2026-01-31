# Crear Usuario de Prueba - Método Alternativo

Si el script SQL `create-test-user.sql` no funciona (por restricciones de permisos), usa uno de estos métodos:

## Método 1: Desde la Aplicación (RECOMENDADO)

1. Ve a la página de registro: `/admin/login?register=true`
2. Completa el formulario con:
   - **Nombre Completo**: Usuario de Prueba
   - **Email**: `test-business@onturn.com`
   - **Contraseña**: `Test123456`
3. Haz clic en "Registrarse"
4. El usuario se creará automáticamente con el rol `business_owner`

## Método 2: Usando Supabase Dashboard

1. Ve a Supabase Dashboard → Authentication → Users
2. Haz clic en "Add User" → "Create new user"
3. Completa:
   - **Email**: `test-business@onturn.com`
   - **Password**: `Test123456`
   - **Auto Confirm User**: ✅ (marca esta casilla)
4. Haz clic en "Create User"
5. Luego ejecuta este SQL para crear el perfil:

```sql
-- Crear perfil para el usuario creado desde el Dashboard
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT 
  id,
  'Usuario de Prueba',
  'business_owner',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'test-business@onturn.com'
ON CONFLICT (id) DO UPDATE
SET full_name = 'Usuario de Prueba',
    role = 'business_owner',
    updated_at = NOW();
```

## Método 3: Usando Supabase CLI (si tienes acceso)

```bash
# Crear usuario usando Supabase CLI
supabase auth admin create-user \
  --email test-business@onturn.com \
  --password Test123456 \
  --email-confirm true

# Luego crear el perfil desde SQL Editor
```

## Verificar que el Usuario Funciona

Después de crear el usuario, prueba iniciar sesión:

1. Ve a `/admin/login`
2. Ingresa:
   - **Email**: `test-business@onturn.com`
   - **Contraseña**: `Test123456`
3. Deberías ser redirigido a `/admin/dashboard`

## Solución de Problemas

### Error: "Invalid login credentials"
- Verifica que el usuario existe en `auth.users`
- Verifica que `email_confirmed_at` no es NULL
- Verifica que la contraseña es correcta
- Si usaste el Dashboard, asegúrate de marcar "Auto Confirm User"

### Error: "User already registered"
- El usuario ya existe, solo necesitas crear el perfil
- Ejecuta solo la parte del perfil del script SQL

### El usuario existe pero no puede iniciar sesión
- Verifica que `email_confirmed_at` tiene un valor (no NULL)
- Si es NULL, ejecuta:
  ```sql
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE email = 'test-business@onturn.com';
  ```
