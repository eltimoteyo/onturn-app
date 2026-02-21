'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmailConfirmationBannerProps {
  userEmail: string
  emailConfirmed: boolean
}

export default function EmailConfirmationBanner({ 
  userEmail, 
  emailConfirmed 
}: EmailConfirmationBannerProps) {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const supabase = createClient()

  if (emailConfirmed) return null

  const handleResendEmail = async () => {
    setResending(true)
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      })
      
      if (error) throw error
      
      setResent(true)
      setTimeout(() => setResent(false), 5000)
    } catch (error) {
      console.error('Error al reenviar email:', error)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
        
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-1">
            ⚠️ Confirma tu email para activar las reservas
          </h3>
          
          <p className="text-sm text-yellow-700 mb-3">
            Enviamos un email de confirmación a <strong>{userEmail}</strong>. 
            Revisa tu bandeja de entrada y haz clic en el enlace para poder recibir reservas.
          </p>

          <div className="text-xs text-yellow-600 space-y-1 mb-3">
            <p>✅ <strong>Ya puedes hacer:</strong> Configurar servicios, horarios, agregar especialistas</p>
            <p>🔒 <strong>Necesitas confirmar email para:</strong> Recibir reservas de clientes</p>
          </div>

          {resent ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle size={16} />
              <span>Email reenviado. Revisa tu bandeja de entrada.</span>
            </div>
          ) : (
            <Button
              onClick={handleResendEmail}
              disabled={resending}
              size="sm"
              variant="outline"
              className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
            >
              <Mail size={16} className="mr-2" />
              {resending ? 'Reenviando...' : 'Reenviar email de confirmación'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
