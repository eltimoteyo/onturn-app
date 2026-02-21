# 🚀 Deployment - OnTurn VPS

## 📍 Ubicación en VPS

```bash
Directorio: /var/www/onturn-app
```

## 🔑 Acceso SSH

```bash
# Conectar al VPS
ssh usuario@ip-del-vps

# Navegar al proyecto
cd /var/www/onturn-app
```

## � Workflow con Docker

El proyecto se despliega usando **Docker Compose**:

1. **Push a Git** (desde tu máquina local)
2. **Pull en VPS** (actualizar código)
3. **Rebuild Docker** (construir nueva imagen)
4. **Restart containers** (aplicar cambios)

## 📦 Actualizar Deployment con FASE 1

### Proceso Completo (Recomendado)

```bash
# 1. Conectar al VPS
ssh usuario@ip-del-vps

# 2. Ir al directorio
cd /var/www/onturn-app

# 3. Detener contenedores actuales
docker compose down

# 4. Hacer backup (opcional pero recomendado)
docker tag onturn-app onturn-app:backup-$(date +%Y%m%d)

# 5. Actualizar código desde Git
git pull origin main

# 6. Reconstruir imagen Docker
docker compose build --no-cache

# 7. Iniciar contenedores
docker compose up -d

# 8. Ver logs para verificar
docker compose logs -f
```

### Proceso Rápido (Sin rebuild completo)

```bash
# 1. Conectar y navegar
ssh usuario@ip-del-vps
cd /var/www/onturn-app

# 2. Actualizar código
git pull origin main

# 3. Rebuild y restart
docker compose up -d --build

# 4. Verificar
docker compose ps
```

## 🔧 Comandos Útiles Docker

### Ver logs de la aplicación
```bash
# Logs en tiempo real
docker compose logs -f

# Logs del contenedor específico
docker compose logs -f app

# Últimas 100 líneas
docker compose logs --tail=100

# Solo errores
docker compose logs app | grep -i error
```

### Verificar estado
```bash
# Estado de contenedores
docker compose ps

# Información detallada
docker compose ps --all
docker inspect onturn-app

# Ver procesos dentro del contenedor
docker compose top
```

### Reiniciar aplicación
```bash
# Reinicio completo (down + up)
docker compose restart

# Solo rebuild y restart
docker compose up -d --build

# Detener contenedores
docker compose down

# Iniciar contenedores
docker compose up -d

# Recrear contenedores (sin rebuild)
docker compose up -d --force-recreate
```

### Limpieza de recursos
```bash
# Ver espacio usado por Docker
docker system df

# Limpiar imágenes sin uso
docker image prune -a

# Limpiar todo (cuidado!)
docker system prune -a

# Ver imágenes
docker images | grep onturn
```

### Verificar Nginx
```bash
# Ver configuración
sudo nginx -t

# Recargar configuración
sudo systemctl reload nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 📋 Checklist Post-Deployment

Después de actualizar, verificar:

- [ ] `docker compose ps` - Contenedor en estado "Up"
- [ ] `docker compose logs --tail=50` - Sin errores críticos
- [ ] Abrir el sitio web - Se carga correctamente
- [ ] Login funciona (con validación Zod)
- [ ] Panel admin accesible
- [ ] Imágenes se cargan
- [ ] Toast notifications funcionan (no hay alerts)
- [ ] Error boundaries activos (ver en consola del navegador)
- [ ] Tests pasan: `docker compose exec app npm test` (opcional)

## 🔄 Variables de Entorno

Verificar que `.env` existe en el VPS (usado por docker-compose.yml):

```bash
cd /var/www/onturn-app
ls -la | grep env
cat .env  # Ver contenido
```

Variables requeridas:
```env
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Puerto (CRÍTICO: NO MODIFICAR - ya asignado en VPS)
PORT=3000

# Node environment (requerido)
NODE_ENV=production
```

**⚠️ IMPORTANTE - Puertos**: 
- **NO modificar el puerto** configurado en `.env` y `docker-compose.yml`
- El VPS tiene múltiples aplicaciones en puertos específicos
- Si hay error de puerto ocupado, verificar con: `sudo lsof -i :3000`
- El archivo `.env` NO debe estar en Git por seguridad

## 🎯 Mejoras de FASE 1 Incluidas

✅ **Error Boundaries**
- Previenen crashes completos de la app
- UI personalizada de error con opciones de retry/home
- Dev mode muestra detalles del error

✅ **28 Tests Pasando**
- Suite de tests para errorHandler, dateFormat, useAuth
- Cobertura de lógica crítica de autenticación
- Tests automatizados con Jest + React Testing Library

✅ **Validación Zod**
- 9 El contenedor no inicia
```bash
# Ver logs detallados
docker compose logs -f

# Ver estado
docker compose ps -a

# ⚠️ IMPORTANTE: NO cambiar puertos, solo verificar
# Ver qué puertos están en uso en el VPS
sudo lsof -i -P -n | grep LISTEN

# Verificar puerto específico de onturn (sin modificarlo)
sudo lsof -i :3000

# Si hay conflicto, contactar admin del VPS
# NO cambiar el puerto en .env o docker-compose.yml

# Reiniciar desde cero
docker compose down
docker compose up -d --build
```

### Build de Docker falla
```bash
# Limpiar cache de Docker
docker builder prune -a

# Rebuild sin cache
docker compose build --no-cache

# Ver logs durante build
docker compose build --progress=plain
```

### Error 502 Bad Gateway (Nginx)
```bash
# Verificar que el contenedor esté corriendo
docker compose ps

# Verificar configuración de Nginx
sudo nginx -t
sudo systemctl restart nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar conectividad contenedor
docker compose exec app wget -O- http://localhost:3000
```

### Contenedor usa mucha memoria
```bash
# Ver uso de recursos
docker stats onturn-app

# Reiniciar contenedor
docker compose restart

# Limitar memoria en docker-compose.yml:
# services:
#   app:
#     deploy:
#       resources:
#         limits:
#           memory: 1G
```

### Actualización no se refleja
```bash
# Forzar rebuild completo
docker compose down
docker compose build --no-cache
docker compose up -d

# Verificar que la imagen sea nueva
docker images | grep onturn
### Error 502 Bad Gateway
```bash
# Verificar que la app esté corriendo
pm2 status

# Verificar configuración de Nginx
sudo nginx -t
sudo systemctl restart nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

## 📊 Monitoreo

### Recursos del servidor
```bash
# Uso de CPU y memoria (fuera de Docker)
- **Docker Build Time**: ~2-5 minutos (primera vez), ~30-60s (rebuilds)
- **Tests**: 28/28 pasando
- **Rutas**: 25 total (estáticas + dinámicas)
- **Node.js**: v20 (Alpine) en Docker
- **Docker**: Compose v2 requerido
- **Nginx**: Reverse proxy recomendado como balanceador

## 🏗️ Arquitectura Docker

```
┌─────────────────────────────────────────┐
│          Nginx (Reverse Proxy)          │
│         puerto 80/443 (HTTPS)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Docker Container: onturn-app       │
│          puerto 3000 (interno)          │
│   ┌─────────────────────────────────┐   │
│   │    Next.js (Standalone)         │   │
│   │    + Node.js 20 Alpine          │   │
│   │    + .next/standalone           │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Supabase (External)             │
│    Database + Auth + Storage            │
└─────────────────────────────────────────┘
```
# Procesos de Node.js
ps aux | grep node
```

### Performance de la app
```bash
# Tiempo de respuesta
curl -w "@curl-format.txt" -o /dev/null -s https://tu-dominio.com

# Crear curl-format.txt:
cat > curl-format.txt << 'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF
```

## 🔐 Seguridad

### Permisos recomendados
```bash
# Usuario y grupo correctos
sudo chown -R www-data:www-data /var/www/onturn-app

# Permisos de archivos
find /var/www/onturn-app -type f -exec chmod 644 {} \;

# Permisos de directorios
find /var/www/onturn-app -type d -exec chmod 755 {} \;

# .env debe ser privado
chmod 600 /var/www/onturn-app/.env.production
```

## 📝 Notas

- **Build Time**: ~23 segundos (fuera de Docker)
- **Docker Build Time**: ~2-5 minutos (primera vez), ~30-60s (rebuilds)
- **Tests**: 28/28 pasando
- **Rutas**: 25 total (estáticas + dinámicas)
- **Node.js**: v20 (Alpine) en Docker
- **Docker**: Compose v2 requerido
- **Nginx**: Reverse proxy recomendado como balanceador
- **⚠️ Puertos**: NO modificar - VPS tiene múltiples apps en puertos específicos

## 🚨 Restricciones Importantes

1. **NO modificar puertos** en `.env` o `docker-compose.yml`
   - El VPS tiene múltiples aplicaciones corriendo
   - Cada puerto está asignado a una aplicación específica
   - Cambiar puertos puede causar conflictos

2. **Verificar puerto asignado** antes de deployment
   ```bash
   # Ver puerto configurado
   grep PORT .env
   grep ports docker-compose.yml
   
   # Verificar que no esté ocupado por otra app
   sudo lsof -i :PUERTO
   ```

3. **Si necesitas cambiar puerto** (solo en emergencia)
   - Contactar al administrador del VPS primero
   - Verificar puertos disponibles
   - Actualizar Nginx config si aplica

## 🏗️ Arquitectura Docker

```
┌─────────────────────────────────────────┐
│          Nginx (Reverse Proxy)          │
│         puerto 80/443 (HTTPS)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Docker Container: onturn-app       │
│          puerto 3000 (interno)          │
│   ┌─────────────────────────────────┐   │
│   │    Next.js (Standalone)         │   │
│   │    + Node.js 20 Alpine          │   │
│   │    + .next/standalone           │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Supabase (External)             │
│    Database + Auth + Storage            │
└─────────────────────────────────────────┘
```

---

**Última actualización**: Febrero 2026 - FASE 1 Completada
