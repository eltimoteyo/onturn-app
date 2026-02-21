/**
 * Hook para diálogos de confirmación elegantes
 * Reemplaza el confirm() nativo del navegador
 */

'use client'

import { create } from 'zustand'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  description: string
  confirmText: string
  cancelText: string
  variant: 'default' | 'destructive'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

interface ConfirmDialogStore extends ConfirmDialogState {
  openDialog: (config: Partial<ConfirmDialogState>) => Promise<boolean>
  closeDialog: () => void
  handleConfirm: () => void
  handleCancel: () => void
}

const useConfirmDialogStore = create<ConfirmDialogStore>((set, get) => ({
  isOpen: false,
  title: '',
  description: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'default',
  onConfirm: () => {},
  onCancel: () => {},
  
  openDialog: (config) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        title: config.title || '¿Estás seguro?',
        description: config.description || '',
        confirmText: config.confirmText || 'Confirmar',
        cancelText: config.cancelText || 'Cancelar',
        variant: config.variant || 'default',
        onConfirm: async () => {
          if (config.onConfirm) await config.onConfirm()
          resolve(true)
          get().closeDialog()
        },
        onCancel: () => {
          if (config.onCancel) config.onCancel()
          resolve(false)
          get().closeDialog()
        },
      })
    })
  },
  
  closeDialog: () => {
    set({ isOpen: false })
  },
  
  handleConfirm: () => {
    const { onConfirm } = get()
    onConfirm()
  },
  
  handleCancel: () => {
    const { onCancel } = get()
    onCancel()
  },
}))

/**
 * Hook para usar diálogos de confirmación
 * 
 * @example
 * ```tsx
 * const { confirm } = useConfirm()
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: '¿Eliminar especialista?',
 *     description: 'Esta acción no se puede deshacer.',
 *     confirmText: 'Sí, eliminar',
 *     variant: 'destructive'
 *   })
 *   
 *   if (confirmed) {
 *     await deleteSpecialist(id)
 *   }
 * }
 * ```
 */
export function useConfirm() {
  const openDialog = useConfirmDialogStore((state) => state.openDialog)
  
  return {
    confirm: openDialog,
  }
}

export { useConfirmDialogStore }
