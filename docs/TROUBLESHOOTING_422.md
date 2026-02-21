# Troubleshooting Error 422 en Registro

## 🔍 Diagnóstico

El error **422 (Unprocessable Content)** en `/auth/v1/signup` ocurre cuando:

1. ✅ **Email ya existe** (más probable)
2. Password muy débil
3. Email inválido
4. Signups deshabilitados en Supabase

---

## ✅ **Solución Implementada**

### **Triple Capa de Protección contra Crashes:**

1. **Validación previa** antes de llamar a Supabase
2. **Try-catch anidado** en la llamada a signup
3. **Error handler global** que intercepta errores no controlados
4. **Finally block** para limpiar estados
5. **Banner específico** para usuario existente con opciones claras

---

## 📋 **Pasos para Resolver el Problema AHORA**

### **OPCIÓN 1: Verificar el Email en la Base de Datos**

```sql
-- Ejecuta esto en Supabase SQL Editor
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'TU_EMAIL_AQUI@gmail.com';

-- Si existe, ELIMÍNALO para poder probar de nuevo:
DELETE FROM auth.users 
WHERE email = 'TU_EMAIL_AQUI@gmail.com';
```

### **OPCIÓN 2: Usar un Email Diferente**

Simplemente usa otro email que NO exista:
- ❌ `test@gmail.com` (ya existe)
- ✅ `test-123-nuevo@gmail.com` (nuevo)

### **OPCIÓN 3: Configurar Supabase para Auto-confirm**

Si quieres facilitar testing:

1. Ve a Supabase Dashboard
2. **Authentication** → **Settings**
3. **Email Auth** 
4. Deshabilita **"Enable email confirmations"** (solo para testing)
5. Prueba de nuevo

---

## 🧪 **Probar con la Consola Ahora**

Abre la consola del navegador (F12) y después de hacer clic en "Registrar", deberías ver:

```javascript
[REGISTRO] Iniciando registro... { email: '...', passwordLength: 8 }
[REGISTRO] Respuesta de signUp: { 
  hasUser: false, 
  errorExists: true,
  errorMessage: "User already registered",
  errorStatus: 422 
}
[REGISTRO] Usuario ya existe detectado
```

Y en la pantalla deberás ver:

```
┌────────────────────────────────────────┐
│ ⚠️ Este email ya está registrado       │
│                                         │
│ [🔐 Iniciar Sesión]                    │
│ [🔑 ¿Olvidaste tu contraseña?]         │
│ [📧 Usar otro email]                   │
└────────────────────────────────────────┘
```

---

## 🚀 **Test Rápido**

```bash
# Email que SEGURO NO EXISTE (usa tu propio número):
test-onturn-87239@gmail.com
```

Con contraseña: `Testing123!`

---

## ⚠️ **Si el error persiste después de todo esto:**

Comparte el output COMPLETO de la consola:

```javascript
[REGISTRO] Iniciando registro...
[REGISTRO] Respuesta de signUp: {...}
[REGISTRO] Error completo: {...}
```

Y yo podré diagnosticar exactamente qué está fallando.

---

## 📝 **Archivos Modificados**

1. ✅ [app/registro-negocio/page.tsx](app/registro-negocio/page.tsx)
   - Triple try-catch
   - Error handler global
   - Banner específico para usuario existente
   - Validaciones previas
   - Logging detallado
