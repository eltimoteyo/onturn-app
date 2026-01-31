# Instrucciones para Configurar la Base de Datos

## Pasos para Ejecutar el Script SQL

1. **Accede a Supabase Dashboard**
   - Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
   - Selecciona tu proyecto OnTurn

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New Query"

3. **Ejecuta el Script**
   - Copia todo el contenido del archivo `scripts/setup-database.sql`
   - Pégalo en el editor SQL
   - Haz clic en "Run" o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verifica la Ejecución**
   - Deberías ver un mensaje de éxito
   - Verifica que las tablas se crearon correctamente:
     - Ve a "Table Editor" en el menú lateral
     - Deberías ver las siguientes tablas:
       - `categories`
       - `businesses`
       - `business_hours`
       - `specialists`
       - `appointments`
       - `business_settings`
       - `profiles`
       - `notifications`

5. **Verifica las Categorías**
   - En "Table Editor", selecciona la tabla `categories`
   - Deberías ver 8 categorías predefinidas:
     - Salud
     - Belleza
     - Deporte
     - Legal
     - Educación
     - Veterinaria
     - Automotriz
     - Hogar

## Solución de Problemas

### Error: "relation already exists"
Si ves este error, significa que algunas tablas ya existen. El script usa `CREATE TABLE IF NOT EXISTS`, así que debería funcionar. Si persiste:
- Elimina las tablas manualmente desde "Table Editor"
- O ejecuta `DROP TABLE` para cada tabla antes de ejecutar el script completo

### Error: "permission denied"
Asegúrate de estar usando el usuario correcto con permisos de administrador en Supabase.

### Error: "type already exists"
Los tipos ENUM ya existen. Esto es normal si ejecutaste el script anteriormente. Puedes ignorar estos mensajes.

## Verificar que Todo Funciona

Después de ejecutar el script, prueba la aplicación:

1. Ve a `/reservas` - deberías ver la lista de establecimientos (vacía si no hay datos)
2. Las categorías deberían aparecer en los filtros
3. Si hay errores, revisa la consola del navegador para más detalles

## Notas Importantes

- **RLS (Row Level Security)**: Está habilitado en todas las tablas para seguridad
- **Políticas Públicas**: Las categorías y negocios activos son visibles para todos
- **Políticas de Propietario**: Solo los dueños pueden modificar sus propios negocios
- **Datos de Ejemplo**: El script incluye 8 categorías de ejemplo

## Próximos Pasos

Después de configurar la base de datos:
1. Crea un usuario de prueba desde la aplicación
2. Crea un negocio de prueba desde el panel admin
3. Prueba crear una reserva
