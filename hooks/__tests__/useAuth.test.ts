/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

// Mock del cliente de Supabase
const mockAuthGetSession = jest.fn()
const mockAuthOnAuthStateChange = jest.fn()
const mockAuthSignOut = jest.fn()
const mockFromSelect = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: mockAuthGetSession,
      onAuthStateChange: mockAuthOnAuthStateChange,
      signOut: mockAuthSignOut,
    },
    from: () => ({
      select: mockFromSelect
    })
  }))
}))

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn()
  }),
  usePathname: () => '/test-path'
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Reset all mocks antes de cada test
    jest.clearAllMocks()
    
    // Mock por defecto del onAuthStateChange
    mockAuthOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  })

  describe('Initial State', () => {
    it('debe inicializar con loading true y sin usuario', async () => {
      mockAuthGetSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const { result } = renderHook(() => useAuth())

      // Estado inicial
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()
      
      // Esperar a que termine la carga
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 2000 })
      
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Authentication States', () => {
    it('debe marcar usuario como autenticado cuando hay sesión válida', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2026-01-01T00:00:00Z'
      }

      // Mock de getSession con sesión válida
      mockAuthGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      })

      // Mock del perfil
      mockFromSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-123', role: 'customer' },
            error: null
          })
        })
      })

      const { result } = renderHook(() => useAuth())

      // Esperar a que el loading sea false
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 3000 })

      // Verificar autenticación
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toBeTruthy()
      expect(result.current.user?.email).toBe('test@example.com')
    })

    it('debe identificar business_owner correctamente', async () => {
      const mockUser = { id: 'user-owner', email: 'owner@business.com' }

      mockAuthGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      })

      mockFromSelect.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-owner', role: 'business_owner' },
            error: null
          })
        })
      })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 3000 })

      expect(result.current.isBusinessOwner).toBe(true)
      expect(result.current.isCustomer).toBe(false)
    })
  })

  describe('Logout', () => {
    it('debe ejecutar signOut correctamente', async () => {
      mockAuthGetSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      mockAuthSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Ejecutar logout
      await result.current.logout()

      expect(mockAuthSignOut).toHaveBeenCalled()
    })
  })
})
