import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/user'

const supabase = createClient()

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        // Return null if profile doesn't exist (PGRST116 is 'The result contains 0 rows')
        if (error.code === 'PGRST116') {
            return null
        }
        throw error
    }
    return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
    // Use upsert to handle cases where profile doesn't exist yet
    const { data, error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            role: 'customer', // Default role if creating new
            ...updates,
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) throw error
    return data as Profile
}

export async function updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) throw error
    return data
}
