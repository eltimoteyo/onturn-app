/**
 * Tests para lib/utils/dateFormat.ts
 */

import { formatDate } from '@/lib/utils/dateFormat'

describe('dateFormat utilities', () => {
  describe('formatDate.short', () => {
    it('should format date as dd/MM/yyyy', () => {
      const date = new Date('2026-02-18T10:30:00Z')
      const result = formatDate.short(date)
      expect(result).toMatch(/\d{2}\/\d{2}\/2026/)
    })

    it('should handle string dates', () => {
      const date = new Date('2026-02-18T12:00:00Z')
      const result = formatDate.short(date)
      expect(result).toMatch(/\d{2}\/\d{2}\/2026/)
    })
  })

  describe('formatDate.long', () => {
    it('should format date in Spanish long format', () => {
      const date = new Date('2026-02-18T10:30:00')
      const result = formatDate.long(date)
      expect(result).toBe('18 de febrero de 2026')
    })
  })

  describe('formatDate.time', () => {
    it('should extract HH:mm from time string', () => {
      const result = formatDate.time('10:30:00')
      expect(result).toBe('10:30')
    })

    it('should handle time without seconds', () => {
      const result = formatDate.time('14:45')
      expect(result).toBe('14:45')
    })
  })

  describe('formatDate.dateTime', () => {
    it('should format date and time combined', () => {
      const date = new Date('2026-02-18T10:30:00')
      const result = formatDate.dateTime(date)
      expect(result).toBe('18/02/2026 a las 10:30')
    })
  })

  describe('formatDate.relative', () => {
    it('should format relative dates in Spanish', () => {
      const now = new Date()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const result = formatDate.relative(yesterday)
      expect(result).toContain('hace')
      expect(result).toContain('día')
    })
  })

  describe('formatDate.smart', () => {
    it('should show "Hoy" for today dates', () => {
      const now = new Date()
      const result = formatDate.smart(now)
      expect(result).toContain('Hoy')
    })

    it('should show "Mañana" for tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const result = formatDate.smart(tomorrow)
      expect(result).toContain('Mañana')
    })

    it('should show "Ayer" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const result = formatDate.smart(yesterday)
      expect(result).toContain('Ayer')
    })

    it('should show full date for dates beyond yesterday/tomorrow', () => {
      const date = new Date('2026-03-25T15:00:00')
      const result = formatDate.smart(date)
      expect(result).toMatch(/\d{1,2} de \w+ a las \d{2}:\d{2}/)
    })
  })

  describe('formatDate.dayName', () => {
    it('should return Spanish day name with number', () => {
      const monday = new Date('2026-02-23T12:00:00Z') // A Monday
      const result = formatDate.dayName(monday)
      // Should return format like "lunes 23" or "domingo 22" depending on timezone
      expect(result).toMatch(/^\w+ \d{1,2}$/)
    })
  })

  describe('formatDate.monthYear', () => {
    it('should return month and year in Spanish', () => {
      const date = new Date('2026-02-18')
      const result = formatDate.monthYear(date)
      expect(result).toBe('febrero 2026')
    })
  })
})
