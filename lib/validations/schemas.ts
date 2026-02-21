import { z } from 'zod'

// Schema para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingresa un correo válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Schema para registro de usuario
export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingresa un correo válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, 'Ingresa un teléfono válido')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Schema para datos de negocio/establecimiento
export const businessSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre es demasiado largo'),
  description: z
    .string()
    .max(1000, 'La descripción es demasiado larga')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(5, 'La dirección es demasiado corta')
    .max(300, 'La dirección es demasiado larga')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad es demasiado larga')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, 'Ingresa un teléfono válido')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Ingresa un correo válido')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Ingresa una URL válida')
    .optional()
    .or(z.literal('')),
})

export type BusinessFormData = z.infer<typeof businessSchema>

// Schema para especialista
export const specialistSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre es demasiado largo'),
  email: z
    .string()
    .email('Ingresa un correo válido')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, 'Ingresa un teléfono válido')
    .optional()
    .or(z.literal('')),
  specialty_id: z
    .string()
    .min(1, 'Debes seleccionar una especialidad'),
  bio: z
    .string()
    .max(500, 'La biografía es demasiado larga')
    .optional()
    .or(z.literal('')),
})

export type SpecialistFormData = z.infer<typeof specialistSchema>

// Schema para especialidad
export const specialtySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  description: z
    .string()
    .max(500, 'La descripción es demasiado larga')
    .optional()
    .or(z.literal('')),
  duration: z
    .number()
    .min(5, 'La duración mínima es 5 minutos')
    .max(480, 'La duración máxima es 8 horas')
    .optional(),
  price: z
    .number()
    .min(0, 'El precio no puede ser negativo')
    .optional(),
})

export type SpecialtyFormData = z.infer<typeof specialtySchema>

// Schema para reserva/cita
export const appointmentSchema = z.object({
  specialty_id: z
    .string()
    .min(1, 'Debes seleccionar un servicio'),
  specialist_id: z
    .string()
    .optional(),
  appointment_date: z
    .string()
    .min(1, 'Debes seleccionar una fecha'),
  appointment_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  customer_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre es demasiado largo'),
  customer_email: z
    .string()
    .email('Ingresa un correo válido'),
  customer_phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, 'Ingresa un teléfono válido'),
  notes: z
    .string()
    .max(1000, 'Las notas son demasiado largas')
    .optional()
    .or(z.literal('')),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

// Schema para horarios de negocio
export const businessHoursSchema = z.object({
  day_of_week: z
    .number()
    .min(0, 'Día inválido')
    .max(6, 'Día inválido'),
  open_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de apertura inválida'),
  close_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de cierre inválida'),
  is_closed: z.boolean().optional(),
}).refine((data) => {
  if (data.is_closed) return true
  return data.open_time < data.close_time
}, {
  message: 'La hora de apertura debe ser antes de la hora de cierre',
  path: ['close_time'],
})

export type BusinessHoursFormData = z.infer<typeof businessHoursSchema>
