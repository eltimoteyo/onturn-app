# Solución: Problemas de Login y Registro con test-business@onturn.com

## Problemas Comunes

### Error 1: "User already registered"
**Causa**: El usuario `test-business@onturn.com` ya existe en Supabase Auth.

**Solución**: 
1. Ve directamente a `/admin/login`
2. Ingresa:
   - **Email**: `test-business@onturn.com`
   - **Contraseña**: `Test123456`
3. Si no puedes iniciar sesión, ejecuta el script `scripts/fix-test-user.sql` para verificar y corregir el usuario

### Error 2: "Invalid login credentials"
**Causa**: El usuario no existe en `auth.users` o no está confirmado (`email_confirmed_at` es NULL).

## Solución Rápida

### Paso 1: Crear el Usuario

**Opción A: Desde la Aplicación (MÁS FÁCIL)**
1. Ve a: `http://localhost:3000/admin/login?register=true` (o tu URL de desarrollo)
2. Completa el formulario:
   - **Nombre Completo**: Usuario de Prueba
   - **Email**: `test-business@onturn.com`
   - **Contraseña**: `Test123456`
3. Haz clic en "Registrarse"
4. El usuario se creará automáticamente y podrás iniciar sesión

**Opción B: Desde Supabase Dashboard**
1. Ve a Supabase Dashboard → Authentication → Users
2. Haz clic en "Add User" → "Create new user"
3. Completa:
   - **Email**: `test-business@onturn.com`
   - **Password**: `Test123456`
   - ✅ **Auto Confirm User**: Marca esta casilla (MUY IMPORTANTE)
4. Haz clic en "Create User"
5. Luego ejecuta este SQL en SQL Editor para crear el perfil:

```sql
INSERT INTO profiles (id, full_name, role, created_at, updated_at)
SELECT id, 'Usuario de Prueba', 'business_owner', NOW(), NOW()
FROM auth.users 
WHERE email = 'test-business@onturn.com'
ON CONFLICT (id) DO UPDATE
SET full_name = 'Usuario de Prueba',
    role = 'business_owner',
    updated_at = NOW();
```

**Opción C: Script SQL (requiere permisos de admin)**
1. Ejecuta el script `scripts/create-test-user.sql` en Supabase SQL Editor
2. Verifica que el usuario fue creado correctamente

### Paso 2: Verificar que el Usuario Funciona

1. Ve a `/admin/login`
2. Ingresa:
   - **Email**: `test-business@onturn.com`
   - **Contraseña**: `Test123456`
3. Deberías ser redirigido a `/admin/dashboard`

## Si el Usuario Ya Existe pero No Puede Iniciar Sesión

Ejecuta este SQL para confirmar el email:

```sql
-- Confirmar el email del usuario
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'test-business@onturn.com';

-- Verificar que se actualizó
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'test-business@onturn.com';
```

## Verificar el Estado del Usuario

Ejecuta este SQL para ver el estado del usuario:

```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'test-business@onturn.com';

-- Verificar el perfil
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'test-business@onturn.com';
```

## Solución de Problemas Comunes

### Error: "Invalid login credentials"
- ✅ Verifica que el usuario existe: `SELECT * FROM auth.users WHERE email = 'test-business@onturn.com';`
- ✅ Verifica que `email_confirmed_at` no es NULL
- ✅ Verifica que la contraseña es correcta
- ✅ Si usaste el Dashboard, asegúrate de marcar "Auto Confirm User"

### Error: "User already registered"
- El usuario ya existe, solo necesitas confirmarlo:
  ```sql
  UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'test-business@onturn.com';
  ```

### El usuario existe pero no tiene perfil
- Crea el perfil:
  ```sql
  INSERT INTO profiles (id, full_name, role, created_at, updated_at)
  SELECT id, 'Usuario de Prueba', 'business_owner', NOW(), NOW()
  FROM auth.users WHERE email = 'test-business@onturn.com'
  ON CONFLICT (id) DO UPDATE
  SET role = 'business_owner', updated_at = NOW();
  ```

## Después de Crear el Usuario

Una vez que el usuario funciona correctamente, puedes ejecutar el script de datos de prueba:

```bash
# Ejecuta insert-test-businesses.sql en Supabase SQL Editor
# Este script usará el usuario test-business@onturn.com como owner de los establecimientos
```
