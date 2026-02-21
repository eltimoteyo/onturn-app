export type UserRole = 'customer' | 'business_owner' | 'admin' | 'specialist' | 'receptionist'

export interface Profile {
  id: string
  full_name?: string
  phone?: string
  avatar?: string
  avatar_url?: string // URL de Supabase Storage
  role: UserRole
  created_at: string
  updated_at: string
}
