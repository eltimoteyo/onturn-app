import { z } from 'zod'

/**
 * Schema para Login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Schema para Registro de Usuario
 */
export const registroSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga')
})

export type RegistroInput = z.infer<typeof registroSchema>

/**
 * Schema para Registro de Negocio
 */
export const registroNegocioSchema = z.object({
  // Datos del solicitante
  applicantName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  applicantEmail: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  
  // Datos del negocio
  businessName: z
    .string()
    .min(2, 'El nombre del negocio es requerido')
    .max(100, 'El nombre es demasiado largo'),
  businessDescription: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional(),
  businessCategoryId: z
    .string()
    .uuid('Categoría inválida')
    .optional(),
  businessAddress: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección es demasiado larga'),
  businessCity: z
    .string()
    .min(2, 'La ciudad es requerida')
    .max(100, 'La ciudad es demasiado larga'),
  businessState: z
    .string()
    .min(2, 'El estado/provincia es requerido')
    .max(100, 'El estado es demasiado largo'),
  businessPhone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(20, 'El teléfono es demasiado largo')
    .regex(/^[0-9+\s()-]+$/, 'Teléfono inválido'),
  businessEmail: z
    .string()
    .email('Email inválido')
    .optional()
})

export type RegistroNegocioInput = z.infer<typeof registroNegocioSchema>

/**
 * Schema para Especialidad
 */
export const especialidadSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  description: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional(),
  duration: z
    .number()
    .int('La duración debe ser un número entero')
    .min(5, 'La duración mínima es 5 minutos')
    .max(480, 'La duración máxima es 8 horas')
    .optional(),
  price: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .optional()
})

export type EspecialidadInput = z.infer<typeof especialidadSchema>

/**
 * Schema para Especialista
 */
export const especialistaSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(20, 'El teléfono es demasiado largo')
    .regex(/^[0-9+\s()-]+$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  specialtyId: z
    .string()
    .uuid('Especialidad inválida'),
  licenseNumber: z
    .string()
    .max(50, 'Número de licencia demasiado largo')
    .optional()
    .or(z.literal(''))
})

export type EspecialistaInput = z.infer<typeof especialistaSchema>

/**
 * Schema para Usuario de Tenant
 */
export const tenantUserSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  role: z
    .enum(['specialist', 'receptionist'], {
      errorMap: () => ({ message: 'Rol inválido' })
    }),
  specialtyId: z
    .string()
    .uuid('Especialidad inválida')
    .optional()
})

export type TenantUserInput = z.infer<typeof tenantUserSchema>

/**
 * Schema para Reserva/Turno
 */
export const reservaSchema = z.object({
  customerName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  customerEmail: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  customerPhone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(20, 'El teléfono es demasiado largo')
    .regex(/^[0-9+\s()-]+$/, 'Teléfono inválido'),
  appointmentDate: z
    .string()
    .min(1, 'La fecha es requerida')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  appointmentTime: z
    .string()
    .min(1, 'La hora es requerida')
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  specialistId: z
    .string()
    .uuid('Especialista inválido')
    .optional(),
  notes: z
    .string()
    .max(500, 'Las notas son demasiado largas')
    .optional()
})

export type ReservaInput = z.infer<typeof reservaSchema>

/**
 * Schema para Configuración de Negocio
 */
export const businessConfigSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  description: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional(),
  address: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección es demasiado larga')
    .optional(),
  city: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad es demasiado larga')
    .optional(),
  state: z
    .string()
    .max(100, 'El estado es demasiado largo')
    .optional(),
  phone: z
    .string()
    .min(8, 'El teléfono debe tener al menos 8 dígitos')
    .max(20, 'El teléfono es demasiado largo')
    .regex(/^[0-9+\s()-]+$/, 'Teléfono inválido')
    .optional(),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal(''))
})

export type BusinessConfigInput = z.infer<typeof businessConfigSchema>

/**
 * Schema para Horario de Negocio
 */
export const businessHoursSchema = z.object({
  dayOfWeek: z
    .number()
    .int()
    .min(0, 'Día inválido')
    .max(6, 'Día inválido'),
  openTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  closeTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  isClosed: z.boolean()
}).refine(
  (data) => {
    if (data.isClosed) return true
    return data.openTime < data.closeTime
  },
  {
    message: 'La hora de apertura debe ser anterior a la hora de cierre',
    path: ['closeTime']
  }
)

export type BusinessHoursInput = z.infer<typeof businessHoursSchema>

/**
 * Helper para formatear errores de Zod
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    formattedErrors[path] = err.message
  })
  
  return formattedErrors
}

/**
 * Helper para validar datos
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return { success: false, errors: formatZodError(result.error) }
}
