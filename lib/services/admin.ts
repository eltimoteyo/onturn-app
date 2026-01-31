import { createClient } from '@/lib/supabase/client'
import type { Business } from '@/types/business'
import type { AppointmentWithRelations } from '@/types/appointment'

const supabase = createClient()

export async function getUserBusinesses(userId: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Business[]
}

export async function getBusinessAppointments(businessId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      businesses (
        id,
        name,
        slug
      ),
      specialists (
        id,
        name,
        specialty
      )
    `)
    .eq('business_id', businessId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (error) throw error

  return data.map(apt => ({
    ...apt,
    business_name: apt.businesses?.name,
    business_slug: apt.businesses?.slug,
    specialist_name: apt.specialists?.name,
    specialty_name: apt.specialists?.specialty,
  })) as AppointmentWithRelations[]
}

export async function getAllBusinessAppointments(userId: string) {
  // Obtener todos los establecimientos del usuario
  const businesses = await getUserBusinesses(userId)
  const businessIds = businesses.map(b => b.id)

  if (businessIds.length === 0) return []

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      businesses (
        id,
        name,
        slug
      ),
      specialists (
        id,
        name,
        specialty
      )
    `)
    .in('business_id', businessIds)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (error) throw error

  return data.map(apt => ({
    ...apt,
    business_name: apt.businesses?.name,
    business_slug: apt.businesses?.slug,
    specialist_name: apt.specialists?.name,
    specialty_name: apt.specialists?.specialty,
  })) as AppointmentWithRelations[]
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'pending' | 'confirmed' | 'in_hall' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
) {
  const { data, error } = await supabase
    .from('appointments')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getBusinessStats(businessId: string) {
  const now = new Date()
  const todayStart = new Date(now.setHours(0, 0, 0, 0))
  const todayEnd = new Date(now.setHours(23, 59, 59, 999))

  const [total, pending, today] = await Promise.all([
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'pending'),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('appointment_date', todayStart.toISOString().split('T')[0])
      .lte('appointment_date', todayEnd.toISOString().split('T')[0]),
  ])

  return {
    total: total.count || 0,
    pending: pending.count || 0,
    today: today.count || 0,
  }
}
