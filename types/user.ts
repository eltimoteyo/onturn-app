export type UserRole = 'customer' | 'business_owner' | 'admin' | 'specialist' | 'receptionist'

export interface Profile {
  id: string
  full_name?: string
  phone?: string
  avatar?: string
  role: UserRole
  created_at: string
  updated_at: string
}
