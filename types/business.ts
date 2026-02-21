export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  color?: string
  created_at: string
  updated_at?: string
}

export interface Business {
  id: string
  owner_id: string
  name: string
  slug: string
  description?: string
  meta_description?: string
  category_id?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  website?: string
  logo?: string
  logo_url?: string // URL de Supabase Storage
  images?: string[]
  auto_confirm: boolean
  is_active: boolean
  // Sistema de aprobación
  approval_status?: 'pending' | 'approved' | 'rejected'
  is_publicly_visible?: boolean
  can_receive_bookings?: boolean // Se activa al confirmar email
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  // Sistema de planes
  plan_type?: 'free' | 'basic' | 'pro' | 'enterprise'
  max_specialists?: number
  max_receptionists?: number
  rating?: number
  total_reviews?: number
  price_range?: string
  max_users?: number
  created_at: string
  updated_at: string
  // Relaciones
  category?: Category
}

export interface BusinessHours {
  id: string
  business_id: string
  day_of_week: number // 0 = Domingo, 6 = Sábado
  open_time: string
  close_time: string
  is_closed: boolean
  created_at: string
}

export interface BusinessSettings {
  id: string
  business_id: string
  slot_duration: number // minutos
  advance_booking_days: number
  reminder_hours: number
  auto_confirm: boolean
  require_phone: boolean
  require_email: boolean
  cancellation_hours: number
  created_at: string
  updated_at: string
}
