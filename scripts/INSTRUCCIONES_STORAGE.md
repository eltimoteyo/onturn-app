# 📸 Configuración de Supabase Storage - OnTurn

## 🎯 Objetivo
Configurar Supabase Storage para subir y gestionar imágenes (avatares, logos) en OnTurn.

---

## 📋 Pasos de Configuración

### Paso 1: Ejecutar Script de Storage

1. **Abre tu proyecto en Supabase Dashboard**
   - Ve a [https://app.supabase.com](https://app.supabase.com)
   - Selecciona tu proyecto OnTurn

2. **Abre el SQL Editor**
   - En el menú lateral, click en **"SQL Editor"**
   - Click en **"New Query"**

3. **Ejecuta el script de configuración**
   - Abre el archivo: `scripts/setup-storage.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor
   - Click en **"Run"** o presiona `Ctrl + Enter`

4. **Verifica que se ejecutó correctamente**
   - Deberías ver mensajes de éxito
   - En el panel de Storage (menú lateral) deberías ver 3 buckets:
     - ✅ `avatars`
     - ✅ `business-logos`
     - ✅ `documents`

---

### Paso 2: Agregar Columnas de Imágenes (Opcional)

Si tus tablas aún no tienen columnas para las URLs de imágenes:

1. **Abre el SQL Editor nuevamente**
2. **Ejecuta el script de columnas**
   - Abre el archivo: `scripts/add-image-columns.sql`
   - Copia todo el contenido
   - Pégalo en el SQL Editor
   - Click en **"Run"**

Este script agrega:
- `avatar_url` en `profiles`
- `logo_url` y `cover_image_url` en `businesses`
- `avatar_url` en `specialists`

---

## 🔍 Verificación

### Verifica los Buckets creados

En **Storage** del menú lateral deberías ver:

```
📁 avatars (público)
   - File size limit: 2 MB
   - Public: ✅
   - MIME types: image/jpeg, image/png, image/webp, image/gif

📁 business-logos (público)
   - File size limit: 3 MB
   - Public: ✅
   - MIME types: image/jpeg, image/png, image/webp, image/svg+xml

📁 documents (privado)
   - File size limit: 5 MB
   - Public: ❌
   - MIME types: application/pdf, image/*
```

### Verifica las Políticas (RLS)

En cada bucket:
1. Click en el bucket
2. Ve a la pestaña **"Policies"**
3. Deberías ver 4 políticas por bucket (SELECT, INSERT, UPDATE, DELETE)

---

## 📊 Estructura de URLs

Las imágenes subidas tendrán URLs como:

**Públicas (avatars y logos):**
```
https://tu-proyecto.supabase.co/storage/v1/object/public/avatars/user-id/imagen.jpg
https://tu-proyecto.supabase.co/storage/v1/object/public/business-logos/business-id/logo.png
```

**Privadas (documents):**
```
https://tu-proyecto.supabase.co/storage/v1/object/authenticated/documents/user-id/documento.pdf
```

---

## 🚀 Siguiente Paso

Una vez completada la configuración en Supabase, el código de OnTurn ya está listo para:
- ✅ Subir imágenes
- ✅ Mostrar previews
- ✅ Eliminar imágenes antiguas
- ✅ Validar formatos y tamaños

---

## 📝 Notas Importantes

1. **Plan Gratuito**: Incluye 1 GB de storage y 2 GB de transferencia/mes
2. **Optimización**: Las imágenes se subirán optimizadas automáticamente
3. **Seguridad**: Las políticas RLS protegen el acceso a los archivos
4. **Borrado**: Al eliminar un registro, se borra automáticamente su imagen

---

## ⚠️ Troubleshooting

**Error: "new row violates row-level security policy"**
- Verifica que las políticas se crearon correctamente
- Asegúrate de estar autenticado

**Error: "File size too large"**
- Los límites son: avatars (2MB), logos (3MB), documents (5MB)
- Comprime las imágenes antes de subir

**Las imágenes no se ven**
- Verifica que el bucket sea público (avatars y business-logos)
- Revisa la URL generada

---

## ✅ Checklist

- [ ] Script `setup-storage.sql` ejecutado
- [ ] 3 buckets creados (avatars, business-logos, documents)
- [ ] Políticas verificadas en cada bucket
- [ ] Script `add-image-columns.sql` ejecutado (opcional)
- [ ] Columnas de URLs agregadas a las tablas
- [ ] Verificación visual en Storage Dashboard

---

**¿Problemas?** Revisa los logs del SQL Editor o contacta al equipo.
