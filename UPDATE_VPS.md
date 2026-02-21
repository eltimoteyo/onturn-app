# 🔄 Guía Rápida: Actualizar VPS con FASE 1

## ⚠️ ANTES DE EMPEZAR

**CRÍTICO**: NO modificar puertos en el VPS
- Hay múltiples aplicaciones corriendo en puertos específicos
- Mantener el puerto configurado en `.env` y `docker-compose.yml`
- Solo actualizar código, NO configuración de puertos

## ⚡ Actualización Rápida (5 minutos)

```bash
# 1. Conectar al VPS
ssh usuario@ip-del-vps

# 2. Navegar al proyecto
cd /var/www/onturn-app

# 3. Verificar puerto configurado (NO MODIFICAR)
grep PORT .env
# Debe mostrar el puerto ya asignado a esta app

# 4. Hacer backup rápido
docker tag onturn-app onturn-app:backup-$(date +%Y%m%d-%H%M%S)

# 5. Actualizar código (si usas Git)
git pull origin main

# 6. Rebuild Docker (mantiene configuración de puertos)
docker compose down
docker compose build --no-cache
docker compose up -d

# 7. Verificar que esté corriendo
docker compose ps
docker compose logs --tail=20
```

## 📦 Archivos Nuevos en FASE 1

Los siguientes archivos se agregaron y deben estar en el VPS:

```
components/shared/ErrorBoundary.tsx    (125 líneas)
hooks/__tests__/useAuth.test.ts        (155 líneas)
lib/schemas/index.ts                   (285 líneas)
```

## ✅ Verificación Post-Update

### 1. Tests funcionan
```bash
npm test (opcional - dentro del contenedor)
```bash
docker compose exec app npm test
# Debe mostrar: Tests: 28 passed, 28 total
```

### 2. Build exitoso (ya hecho durante docker build)
```bash
# Verificar logs del build
docker compose logs --tail=100 | grep "Compiled successfully"
```

### 3. Contenedor corriendo
```bash
docker compose ps
# Estado: Up (verde)
```

### 4. Sin errores en logs
```bash
docker compose logs --tail=50
# No debe haber errores de React, solo logs normales
```

### 5. Puerto correcto (NO MODIFICADO)
```bash
# Verificar que usa el puerto asignado
docker compose port app 3000
# Debe mostrar el puerto correcto del VPS
### 5. Funcionalidades críticas
- Abrir: `https://tu-dominio.com`
- Login funciona (con validación Zod)
- No hay alerts del navegador (todo debe ser Toast)
- Si hay error, debe mostrar Error Boundary (no crash)

## 🎯 Qué Mejoró en FASE 1

| Antes | Después |
|-------|---------|
| 46 browser alerts | Toast notifications |
| 24 tests | 28 tests |
| Sin error boundaries | Error boundaries activos |
| Validacicontenedor actual
docker compose down

# Restaurar imagen de backup
docker tag onturn-app:backup-FECHA onturn-app:latest

# Reiniciar con backup
docker compose up -d
```

### Limpiar y reinstalar
```bash
# Limpiar todo
docker compose down
docker builder prune -a

# Rebuild desde cero
docker compose build --no-cache
docker compose up -d
```

### Verificar puertos (NO MODIFICAR)
```bash
# Ver todos los puertos en uso en el VPS
sudo lsof -i -P -n | grep LISTEN

# Ver configuración actual de onturn
grep PORT .env
grep ports docker-compose.yml

# Si hay conflicto, contactar admin del VPS
# NO cambiar puertos sin coordinación
npm install

# Rebuild
npm run build
docker compose logs -f`
2. Verificar espacio: `df -h`
3. Ver procesos: `docker compose ps`
4. Logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
5. **NO modificar puertos** - contactar admin si hay conflicto

---

**Tiempo estimado**: 5-10 minutos  
**Riesgo**: Bajo (hay backup automático)  
**Beneficios**: App más estable, mejor UX, código testeado  
**⚠️ CRÍTICO**: NO tocar configuración de puertos del VPS
3. Ver procesos: `pm2 status`
4. Logs de Nginx: `sudo tail -f /var/log/nginx/error.log`

---

**Tiempo estimado**: 5-10 minutos
**Riesgo**: Bajo (hay backup automático)
**Beneficios**: App más estable, mejor UX, código testeado
