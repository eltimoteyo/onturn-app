/**
 * Tests para lib/utils/errorHandler.ts
 */

import { 
  handleError, 
  getErrorMessage,
  type ProcessedError
} from '@/lib/utils/errorHandler'

// Mock console.error para evitar ruido en tests
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('errorHandler utilities', () => {
  describe('getErrorMessage', () => {
    it('should return friendly message for PGRST116 error', () => {
      const error = new Error('PGRST116: No rows found')
      const result = getErrorMessage(error, 'TEST_CONTEXT')
      expect(result).toBe('No se encontró el recurso solicitado')
    })

    it('should return friendly message for unique constraint errors', () => {
      const error = new Error('duplicate key value violates unique constraint')
      const result = getErrorMessage(error)
      expect(result).toBe('Este registro ya existe. Por favor usa valores diferentes.')
    })

    it('should return friendly message for permission errors', () => {
      const error = new Error('permission denied for table businesses')
      const result = getErrorMessage(error)
      expect(result).toBe('No tienes permisos para realizar esta acción')
    })

    it('should return friendly message for network errors', () => {
      const error = new Error('Failed to fetch')
      const result = getErrorMessage(error)
      expect(result).toBe('Error de conexión. Verifica tu internet e intenta de nuevo.')
    })

    it('should return generic message for unknown errors', () => {
      const error = new Error('Some random error')
      const result = getErrorMessage(error)
      expect(result).toBe('Ocurrió un error inesperado. Por favor intenta de nuevo.')
    })

    it('should handle non-Error objects', () => {
      const result = getErrorMessage('string error')
      expect(result).toBe('Ocurrió un error inesperado. Por favor intenta de nuevo.')
    })
  })

  describe('handleError', () => {
    it('should log error with context', () => {
      const consoleSpy = jest.spyOn(console, 'error')
      const error = new Error('Test error')
      
      handleError(error, 'TEST_OPERATION')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR:TEST_OPERATION]',
        expect.any(Error)
      )
    })

    it('should log without context', () => {
      const consoleSpy = jest.spyOn(console, 'error')
      const error = new Error('Test error')
      
      handleError(error)
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ERROR]',
        expect.any(Error)
      )
    })

    it('should return ProcessedError object with user-friendly message', () => {
      const error = new Error('PGRST116: Not found')
      const result = handleError(error, 'GET_BUSINESS')
      
      expect(result).toHaveProperty('message', 'PGRST116: Not found')
      expect(result).toHaveProperty('userMessage', 'No se encontró el recurso solicitado')
    })

    it('should handle foreign key constraint errors', () => {
      const error = new Error('violates foreign key constraint')
      const result = handleError(error)
      
      expect(result.userMessage).toBe('No se puede eliminar porque hay otros elementos relacionados')
    })

    it('should handle authentication errors', () => {
      const error = new Error('Invalid login credentials')
      const result = handleError(error)
      
      expect(result.userMessage).toBe('Credenciales incorrectas. Verifica tu email y contraseña.')
    })
  })
})
