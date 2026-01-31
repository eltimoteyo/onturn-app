# OnTurn - Sistema de Gestión de Reservas

Sistema multi-rubro de gestión de reservas/turnos construido con Next.js 16, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características

- **Landing Page**: Atrae usuarios y negocios con secciones separadas
- **Panel de Usuario**: Búsqueda, filtros y reserva de turnos
- **Panel Admin**: Gestión completa de establecimientos, reservas y especialistas
- **Dashboard de Usuario**: Próximos turnos e historial completo
- **SEO Optimizado**: URLs limpias y meta tags dinámicos
- **PWA Ready**: Preparado para Progressive Web App

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React
- **Formularios**: React Hook Form + Zod

## 📦 Instalación

1. **Clonar el repositorio**
```bash
cd onturn-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

   **Opción A: Copiar desde CyberCita (Recomendado)**
   
   Si ya tienes el proyecto CyberCita configurado, puedes copiar automáticamente las credenciales:
   ```bash
   npm run copy-credentials
   ```
   
   Este comando lee las credenciales de `cybercitas/.env` y crea el archivo `.env.local` en OnTurn.
   
   **Opción B: Configuración manual**
   
   Crea un archivo `.env.local` basado en `env.example.txt`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_vapid_public_key
   ```
   
   Ver `COPIAR_CREDENCIALES.md` para más detalles.

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
onturn-app/
├── app/                    # App Router (Next.js)
│   ├── (landing)/         # Landing page
│   ├── (reservas)/        # Panel de usuario
│   ├── (admin)/           # Panel admin
│   ├── login/             # Página de login
│   └── layout.tsx         # Layout root
├── components/
│   ├── ui/                # Componentes base UI
│   ├── shared/            # Componentes compartidos
│   ├── landing/           # Componentes landing
│   ├── reservas/          # Componentes reservas
│   └── admin/             # Componentes admin
├── lib/
│   ├── supabase/          # Clientes Supabase
│   ├── services/          # Servicios de negocio
│   └── utils.ts           # Utilidades
├── hooks/                  # Custom hooks
└── types/                  # TypeScript types
```

## 🎨 Colores

Manteniendo la identidad visual de CyberCita:
- **Primary**: Azul (#3b82f6, #2563eb)
- **Accent**: Turquesa (HSL: 168 100% 33%)
- **Success**: Verde (#10b981)
- **Warning**: Amarillo (#f59e0b)
- **Destructive**: Rojo (#ef4444)

## 📝 Próximos Pasos

- [ ] Configurar base de datos en Supabase
- [ ] Implementar páginas de reservas
- [ ] Implementar panel admin
- [ ] Configurar PWA
- [ ] Implementar notificaciones push

## 📄 Licencia

Este proyecto es de código abierto.
