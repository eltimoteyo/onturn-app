import { createClient } from '@/lib/supabase/client'
import type { Appointment, AppointmentWithRelations, AppointmentStatus } from '@/types/appointment'
import { addMinutes, format, isAfter, isBefore, isSameDay, parseISO, set } from 'date-fns'

const supabase = createClient()

export async function getUserAppointments(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      businesses (
        id,
        name,
        slug,
        address,
        city,
        phone,
        email
      ),
      specialists (
        id,
        name,
        specialty
      )
    `)
    .eq('user_id', userId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (error) throw error

  // Transformar datos
  return data.map(apt => ({
    ...apt,
    business_name: apt.businesses?.name,
    business_slug: apt.businesses?.slug,
    business_address: apt.businesses?.address,
    business_city: apt.businesses?.city,
    business_phone: apt.businesses?.phone,
    business_email: apt.businesses?.email,
    specialist_name: apt.specialists?.name,
    specialty_name: apt.specialists?.specialty,
  })) as AppointmentWithRelations[]
}

export async function getAppointmentById(appointmentId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      businesses (
        id,
        name,
        slug,
        address,
        city,
        phone,
        email
      ),
      specialists (
        id,
        name,
        specialty
      )
    `)
    .eq('id', appointmentId)
    .single()

  if (error) throw error

  // Transformar datos
  return {
    ...data,
    business_name: data.businesses?.name,
    business_slug: data.businesses?.slug,
    business_address: data.businesses?.address,
    business_city: data.businesses?.city,
    business_phone: data.businesses?.phone,
    business_email: data.businesses?.email,
    specialist_name: data.specialists?.name,
    specialty_name: data.specialists?.specialty,
  } as AppointmentWithRelations
}

export async function createAppointment(appointmentData: {
  business_id: string
  specialist_id?: string
  user_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  appointment_date: string
  appointment_time: string
  notes?: string
}) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointmentData,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data as Appointment
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) throw error
  return data as Appointment
}

export async function getAvailableSlots(
  businessId: string,
  date: string,
  specialistId?: string
): Promise<string[]> {
  try {
    // Obtener configuración del negocio
    const { data: settings } = await supabase
      .from('business_settings')
      .select('slot_duration')
      .eq('business_id', businessId)
      .single()

    const slotDuration = settings?.slot_duration || 30

    // Obtener el día de la semana de la fecha seleccionada
    // date viene como YYYY-MM-DD string.
    // parseISO lo convierte correctamente a Date local o UTC según string. 
    // Asumimos que "date" es la fecha LOCAL que ve el usuario.
    // Para evitar problemas de timezone, creamos la fecha a las 00:00 local, o usamos parseISO y extraemos dia.
    // Ojo: getDay() devuelve día local.
    const dateObj = parseISO(date)
    // Ajuste importante: Si 'date' es '2024-01-29', parseISO devuelve '2024-01-29T00:00:00' local (si no tiene Z).
    // Si viene solo fecha, parseISO la trata como local time. OK.

    // date-fns v2/v3 getDay: 0=Sunday, 1=Monday...
    // Nuestra DB: 0=Domingo... (Confirmado en view anterior de configuracion/page.tsx)
    const dayOfWeek = dateObj.getDay()

    // Obtener horarios del negocio para ese día
    const { data: dayHours } = await supabase
      .from('business_hours')
      .select('open_time, close_time, is_closed')
      .eq('business_id', businessId)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (!dayHours || dayHours.is_closed || !dayHours.open_time || !dayHours.close_time) {
      return []
    }

    // Obtener citas existentes para esa fecha
    // Filtramos por fecha completa en rango local
    const startOfDayStr = `${date}T00:00:00`
    const endOfDayStr = `${date}T23:59:59`

    let query = supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('business_id', businessId)
      .in('status', ['confirmed', 'pending']) // Pending también bloquea para evitar doble booking inmediato
      .gte('start_time', startOfDayStr)
      .lte('start_time', endOfDayStr)

    if (specialistId && specialistId !== 'any') {
      query = query.eq('specialist_id', specialistId)
    }

    const { data: appointments } = await query

    // Generar slots
    const slots: string[] = []

    // Parsear horas de apertura/cierre
    const [openHour, openMinute] = dayHours.open_time.split(':').map(Number)
    const [closeHour, closeMinute] = dayHours.close_time.split(':').map(Number)

    // Crear fecha base para los slots (usando la fecha solicitada)
    let currentSlot = set(dateObj, {
      hours: openHour,
      minutes: openMinute,
      seconds: 0,
      milliseconds: 0
    })

    const closeTime = set(dateObj, {
      hours: closeHour,
      minutes: closeMinute,
      seconds: 0,
      milliseconds: 0
    })

    const now = new Date()

    // Iterar generando slots
    while (isBefore(currentSlot, closeTime)) {
      const endOfSlot = addMinutes(currentSlot, slotDuration)

      // Si el turno termina después del cierre, no es válido (a menos que permitamos ultimo turno terminar al cierre)
      // Usualmente si cierran a las 18:00, ultimo turno de 30m es 17:30-18:00.
      // Si endOfSlot > closeTime, entonces se pasa.
      if (isAfter(endOfSlot, closeTime)) break;

      // Si es hoy, filtrar horarios pasados
      // Comparar currentSlot con now.
      if (isSameDay(dateObj, now) && isBefore(currentSlot, now)) {
        currentSlot = addMinutes(currentSlot, slotDuration)
        continue
      }

      // Verificar colisiones
      const isOccupied = appointments?.some(app => {
        const appStart = new Date(app.start_time)
        const appEnd = new Date(app.end_time)

        // Overlap: (StartA < EndB) and (EndA > StartB)
        return isBefore(currentSlot, appEnd) && isAfter(endOfSlot, appStart)
      })

      if (!isOccupied) {
        slots.push(format(currentSlot, 'HH:mm'))
      }

      currentSlot = addMinutes(currentSlot, slotDuration)
    }

    return slots

  } catch (error) {
    console.error('Error fetching available slots:', error)
    return []
  }
}
