/**
 * Utilidades para formateo consistente de fechas en toda la aplicación
 * Usa date-fns con locale español
 */

import { format, formatDistance, isPast, isToday, isTomorrow, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Convierte string o Date a objeto Date
 */
function toDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date
}

/**
 * Formatos de fecha consistentes para toda la app
 */
export const formatDate = {
  /**
   * Formato corto: 18/02/2026
   */
  short: (date: string | Date) => {
    return format(toDate(date), 'dd/MM/yyyy', { locale: es })
  },

  /**
   * Formato largo: 18 de febrero de 2026
   */
  long: (date: string | Date) => {
    return format(toDate(date), "dd 'de' MMMM 'de' yyyy", { locale: es })
  },

  /**
   * Formato de tiempo: 10:30 (de "10:30:00")
   */
  time: (time: string) => {
    return time.slice(0, 5)
  },

  /**
   * Formato de fecha y hora: 18/02/2026 a las 10:30
   */
  dateTime: (date: string | Date) => {
    return format(toDate(date), "dd/MM/yyyy 'a las' HH:mm", { locale: es })
  },

  /**
   * Formato relativo: "hace 2 días", "en 3 horas"
   */
  relative: (date: string | Date) => {
    return formatDistance(toDate(date), new Date(), { 
      addSuffix: true, 
      locale: es 
    })
  },

  /**
   * Formato inteligente según cercanía
   * Hoy: "Hoy a las 10:30"
   * Mañana: "Mañana a las 10:30"
   * Ayer: "Ayer a las 10:30"
   * Otros: "18 de febrero a las 10:30"
   */
  smart: (date: string | Date) => {
    const dateObj = toDate(date)
    
    if (isToday(dateObj)) {
      return `Hoy a las ${format(dateObj, 'HH:mm', { locale: es })}`
    }
    
    if (isTomorrow(dateObj)) {
      return `Mañana a las ${format(dateObj, 'HH:mm', { locale: es })}`
    }
    
    if (isYesterday(dateObj)) {
      return `Ayer a las ${format(dateObj, 'HH:mm', { locale: es })}`
    }
    
    return format(dateObj, "dd 'de' MMMM 'a las' HH:mm", { locale: es })
  },

  /**
   * Solo día del mes con nombre: "Lunes 18"
   */
  dayName: (date: string | Date) => {
    return format(toDate(date), "EEEE dd", { locale: es })
  },

  /**
   * Mes y año: "Febrero 2026"
   */
  monthYear: (date: string | Date) => {
    return format(toDate(date), "MMMM yyyy", { locale: es })
  },
}

/**
 * Helpers para validación de fechas
 */
export const dateHelpers = {
  isPast: (date: string | Date) => isPast(toDate(date)),
  isToday: (date: string | Date) => isToday(toDate(date)),
  isTomorrow: (date: string | Date) => isTomorrow(toDate(date)),
}
