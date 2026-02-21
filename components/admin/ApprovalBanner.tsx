'use client'

import { AlertCircle, CheckCircle, Clock, Zap, Users, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Business } from '@/types/business'

interface ApprovalBannerProps {
  business: Business
}

export function ApprovalBanner({ business }: ApprovalBannerProps) {
  const { approval_status,  plan_type, max_specialists, max_receptionists } = business

  // Si ya está aprobado, no mostrar banner
  if (approval_status === 'approved') {
    return null
  }

  // Banner de negocio rechazado
  if (approval_status === 'rejected') {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6 animate-in fade-in">
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">
              ❌ Solicitud Rechazada
            </h3>
            <p className="text-red-700 text-sm mb-3">
              {business.rejection_reason || 'Tu solicitud no pudo ser aprobada. Por favor contacta a soporte para más detalles.'}
            </p>
            <div className="flex gap-3">
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => window.open('https://wa.me/51999999999', '_blank')}
              >
                📱 Contactar por WhatsApp
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => window.location.href = 'mailto:soporte@onturn.com'}
              >
                📧 Enviar Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Banner de negocio pendiente de aprobación
  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 mb-6 animate-in fade-in shadow-lg">
      <div className="flex items-start gap-4">
        <div className="bg-orange-100 p-3 rounded-full animate-pulse">
          <Clock className="text-orange-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-2">
            ⏳ Tu negocio está siendo revisado
          </h3>
          <p className="text-orange-800 text-sm mb-4">
            Nuestro equipo está evaluando tu solicitud. Mientras tanto, puedes configurar los datos básicos de tu negocio.
          </p>

          {/* Estado actual */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-orange-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-slate-600">Plan:</span>
                <span className="font-bold text-orange-700 uppercase">{plan_type || 'FREE'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-slate-600">Especialistas permitidos:</span>
                <span className="font-bold text-blue-700">{max_specialists || 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-slate-600">Recepcionistas permitidos:</span>
                <span className="font-bold text-purple-700">{max_receptionists || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-slate-600">Estado:</span>
                <span className="font-bold text-red-700">Pendiente de aprobación</span>
              </div>
            </div>
          </div>

          {/* Limitaciones actuales */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
            <p className="text-sm font-bold text-yellow-900 mb-2">⚠️ Limitaciones temporales:</p>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Tu negocio <strong>NO aparece</strong> en las búsquedas públicas del sitio</li>
              <li>Para recibir reservas, primero <strong>confirma tu email</strong></li>
              <li>Solo puedes gestionar <strong>{max_specialists || 1} especialista(s)</strong> con el plan {plan_type?.toUpperCase() || 'FREE'}</li>
              <li>No puedes agregar recepcionistas u otros usuarios (Plan FREE)</li>
            </ul>
          </div>

          {/* Lo que SÍ puedes hacer */}
          <div className="bg-green-50 rounded-xl p-4 mb-4 border border-green-200">
            <p className="text-sm font-bold text-green-900 mb-2">✅ Lo que SÍ puedes hacer ahora:</p>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Configurar los horarios de atención</li>
              <li>Completar los datos de tu negocio</li>
              <li>Agregar tus especialidades/servicios</li>
              <li>Subir el logo de tu negocio</li>
              <li>Recibir reservas por link directo (después de confirmar email)</li>
            </ul>
          </div>

          {/* CTA para upgrade y contacto */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 flex-1"
              onClick={() => window.open('https://wa.me/51999999999?text=Hola%2C%20quiero%20información%20sobre%20el%20estado%20de%20mi%20solicitud', '_blank')}
            >
              📱 ¿Cuándo será aprobado?
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 flex-1"
              onClick={() => alert('Próximamente: Sistema de planes premium')}
            >
              <Crown size={16} className="mr-1" />
              Ver Planes Premium
            </Button>
          </div>

          {/* Información adicional */}
          <div className="mt-4 pt-4 border-t border-orange-200">
            <p className="text-xs text-orange-700">
              💡 <strong>Tip:</strong> Completa toda la información de tu negocio para acelerar el proceso de aprobación.
              Nuestro equipo revisa las solicitudes en menos de 24 horas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Banner simple cuando el negocio está aprobado (persuasión para upgrade)
export function UpgradeBanner({ business }: ApprovalBannerProps) {
  if (business.approval_status !== 'approved' || business.plan_type !== 'free') {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-5 mb-6 animate-in fade-in">
      <div className="flex items-start gap-4">
        <div className="bg-purple-100 p-2.5 rounded-full">
          <Zap className="text-purple-600" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-purple-900 mb-1">
            🚀 ¿Necesitas más usuarios en tu equipo?
          </h3>
          <p className="text-purple-700 text-sm mb-3">
            Con el <strong>Plan Basic</strong> puedes agregar hasta 3 especialistas y 1 recepcionista. 
            Mejora la gestión de tu negocio.
          </p>
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => alert('Próximamente: Actualización de plan')}
          >
            <Users size={16} className="mr-1" />
            Actualizar Plan desde $19/mes
          </Button>
        </div>
      </div>
    </div>
  )
}
