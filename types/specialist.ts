export interface Specialist {
  id: string
  business_id: string
  name: string
  slug: string
  email?: string
  phone?: string
  specialty?: string
  description?: string
  avatar?: string
  bio?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpecialistAvailability {
  id: string
  specialist_id: string
  day_of_week: number // 0 = Domingo, 6 = Sábado
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
}
