import { Business } from './business'
import { Specialist } from './specialist'

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_hall' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  business_id: string
  specialist_id?: string
  user_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  appointment_date: string // DATE
  appointment_time: string // TIME
  status: AppointmentStatus
  notes?: string
  result?: string
  result_notes?: string
  prescription?: string
  attachments?: Array<{
    name: string
    url: string
  }>
  created_at: string
  updated_at: string
  // Relaciones
  business?: Business
  specialist?: Specialist
}

export interface AppointmentWithRelations extends Appointment {
  business_name?: string
  business_slug?: string
  business_address?: string
  business_city?: string
  business_phone?: string
  business_email?: string
  specialist_name?: string
  specialty_name?: string
}
