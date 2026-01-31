import { createClient } from '@/lib/supabase/client'

export interface Specialty {
    id: string
    business_id: string
    name: string
    description?: string
    duration: number
    is_active: boolean
    created_at: string
}

const supabase = createClient()

export async function getSpecialtiesByBusiness(businessId: string) {
    const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('name', { ascending: true })

    if (error) throw error
    return data as Specialty[]
}
