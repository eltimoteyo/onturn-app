/**
 * Componente de estados vacíos elegantes
 * Para usar cuando no hay datos que mostrar
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Empty state con icono, texto y acción opcional
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Building2 className="h-16 w-16" />}
 *   title="No hay establecimientos"
 *   description="Aún no se han registrado establecimientos en esta categoría"
 *   action={{ label: "Ver todos", onClick: () => router.push('/reservas') }}
 * />
 * ```
 */
export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <Card className={`border-0 shadow-md ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        {/* Icono */}
        <div className="mb-6 text-slate-300">
          {icon}
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-slate-900 mb-3">
          {title}
        </h3>

        {/* Descripción */}
        <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
          {description}
        </p>

        {/* Acción opcional */}
        {action && (
          <Button onClick={action.onClick} size="lg">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Empty state compacto (sin card)
 */
export function EmptyStateSimple({ 
  icon, 
  title, 
  description, 
  action,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="mb-4 text-slate-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Empty state de búsqueda sin resultados
 */
export function EmptySearchState({ 
  searchTerm,
  onClear,
}: { 
  searchTerm: string
  onClear: () => void 
}) {
  return (
    <EmptyStateSimple
      icon={
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="No se encontraron resultados"
      description={`No hay resultados para "${searchTerm}". Intenta con otros términos.`}
      action={{ label: 'Limpiar búsqueda', onClick: onClear }}
    />
  )
}
