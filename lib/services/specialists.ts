import { createClient } from '@/lib/supabase/client'
import type { Specialist, SpecialistAvailability } from '@/types/specialist'

const supabase = createClient()

export async function getSpecialistsByBusiness(businessId: string) {
  const { data, error } = await supabase
    .from('specialists')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return data as Specialist[]
}

export async function getSpecialistBySlug(businessId: string, slug: string) {
  const { data, error } = await supabase
    .from('specialists')
    .select('*')
    .eq('business_id', businessId)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as Specialist
}

export async function getSpecialistAvailability(specialistId: string) {
  const { data, error } = await supabase
    .from('specialist_availability')
    .select('*')
    .eq('specialist_id', specialistId)
    .eq('is_available', true)
    .order('day_of_week', { ascending: true })

  if (error) throw error
  return data as SpecialistAvailability[]
}
