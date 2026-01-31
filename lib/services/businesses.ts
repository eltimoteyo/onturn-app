import { createClient } from '@/lib/supabase/client'
import type { Business, Category, BusinessHours } from '@/types/business'

const supabase = createClient()

export async function getAllBusinesses() {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error en getAllBusinesses:', error)
    throw new Error(`Error al cargar establecimientos: ${error.message}`)
  }
  return (data || []) as Business[]
}

export async function getBusinessBySlug(slug: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as Business
}

export async function getBusinessesByCategory(categorySlug: string) {
  // Primero obtenemos la categoría por slug
  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (categoryError) {
    console.error('Error al buscar categoría:', categoryError)
    throw new Error(`Error al buscar categoría: ${categoryError.message}`)
  }

  if (!categoryData) {
    return []
  }

  // Luego obtenemos los negocios de esa categoría
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_active', true)
    .eq('category_id', categoryData.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error en getBusinessesByCategory:', error)
    throw new Error(`Error al cargar establecimientos por categoría: ${error.message}`)
  }
  return (data || []) as Business[]
}

export async function searchBusinesses(query: string) {
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error en searchBusinesses:', error)
    throw new Error(`Error al buscar establecimientos: ${error.message}`)
  }
  return (data || []) as Business[]
}

export async function getBusinessHours(businessId: string) {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('business_id', businessId)
    .order('day_of_week', { ascending: true })

  if (error) throw error
  return data as BusinessHours[]
}

export async function getAllCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error en getAllCategories:', error)
    throw new Error(`Error al cargar categorías: ${error.message}`)
  }
  return (data || []) as Category[]
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Category
}
