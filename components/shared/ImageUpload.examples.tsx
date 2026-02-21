// ============================================================
// EJEMPLO DE USO DEL COMPONENTE IMAGEUPLOAD
// ============================================================

/*
Este archivo muestra cómo usar el componente ImageUpload
en diferentes contextos de la aplicación OnTurn.
*/

import { ImageUpload } from '@/components/shared/ImageUpload'
import { useState } from 'react'
import { updateSpecialist } from '@/lib/services/specialists'
import { useAuth } from '@/hooks/useAuth'

// ============================================================
// 1. SUBIR AVATAR DE USUARIO
// ============================================================
export function UserProfileExample() {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const handleAvatarUploaded = async (url: string, path: string) => {
    setAvatarUrl(url)
    
    // Guardar en la base de datos
    // await supabase
    //   .from('profiles')
    //   .update({ avatar_url: url })
    //   .eq('id', user?.id)
  }

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-bold mb-4">Avatar de Usuario</h3>
      <ImageUpload
        currentImageUrl={avatarUrl || undefined}
        onImageUploaded={handleAvatarUploaded}
        bucket="avatars"
        folder={user?.id}
        maxSizeInMB={2}
        previewSize="md"
        shape="circle"
        buttonText="Cambiar avatar"
        compress={true}
      />
    </div>
  )
}


// ============================================================
// 2. SUBIR LOGO DE NEGOCIO
// ============================================================
export function BusinessLogoExample() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const businessId = 'business-123' // Obtener del contexto

  const handleLogoUploaded = async (url: string, path: string) => {
    setLogoUrl(url)
    
    // Guardar en la base de datos
    // await supabase
    //   .from('businesses')
    //   .update({ logo_url: url })
    //   .eq('id', businessId)
  }

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-bold mb-4">Logo del Negocio</h3>
      <ImageUpload
        currentImageUrl={logoUrl || undefined}
        onImageUploaded={handleLogoUploaded}
        bucket="business-logos"
        folder={businessId}
        maxSizeInMB={3}
        previewSize="lg"
        shape="square"
        buttonText="Subir logo"
        compress={true}
        allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']}
      />
    </div>
  )
}


// ============================================================
// 3. SUBIR AVATAR DE ESPECIALISTA (en formulario)
// ============================================================
export function SpecialistFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar_url: ''
  })

  const handleAvatarUploaded = (url: string, path: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }))
  }

  const handleSubmit = async () => {
    // Crear o actualizar especialista con la URL del avatar
    const specialist = {
      ...formData,
      avatar_url: formData.avatar_url
    }
    // await createSpecialist(specialist)
  }

  return (
    <form className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-bold mb-2">Foto del Especialista</label>
        <ImageUpload
          currentImageUrl={formData.avatar_url}
          onImageUploaded={handleAvatarUploaded}
          bucket="avatars"
          folder="specialists"
          maxSizeInMB={2}
          previewSize="md"
          shape="circle"
          buttonText="Agregar foto"
        />
      </div>

      <input
        type="text"
        placeholder="Nombre"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        className="w-full p-2 border rounded"
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        className="w-full p-2 border rounded"
      />

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Guardar Especialista
      </button>
    </form>
  )
}


// ============================================================
// 4. SUBIR DOCUMENTO (privado)
// ============================================================
export function DocumentUploadExample() {
  const { user } = useAuth()
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  const handleDocumentUploaded = (url: string, path: string) => {
    setDocumentUrl(url)
    
    // Guardar referencia en appointments o donde corresponda
    // await supabase
    //   .from('appointment_documents')
    //   .insert({ 
    //     appointment_id: appointmentId,
    //     document_url: url,
    //     document_path: path
    //   })
  }

  return (
    <div className="max-w-md">
      <h3 className="text-lg font-bold mb-4">Subir Receta/Documento</h3>
      <ImageUpload
        currentImageUrl={documentUrl || undefined}
        onImageUploaded={handleDocumentUploaded}
        bucket="documents"
        folder={user?.id}
        maxSizeInMB={5}
        previewSize="lg"
        shape="square"
        buttonText="Subir documento"
        compress={false} // No comprimir PDFs
        allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/webp']}
      />
    </div>
  )
}


// ============================================================
// 5. USO EN PÁGINA DE CONFIGURACIÓN (COMPLETO)
// ============================================================
/*
En tu página app/admin/configuracion/page.tsx, agrega esto:

import { ImageUpload } from '@/components/shared/ImageUpload'

// Dentro del componente
const [business, setBusiness] = useState<Business | null>(null)

const handleLogoUploaded = async (url: string, path: string) => {
  if (!business) return
  
  // Actualizar en Supabase
  const { error } = await supabase
    .from('businesses')
    .update({ logo_url: url })
    .eq('id', business.id)
    
  if (!error) {
    setBusiness({ ...business, logo_url: url })
    success('Logo actualizado exitosamente')
  }
}

// En el JSX
<Card>
  <CardHeader>
    <CardTitle>Logo del Negocio</CardTitle>
  </CardHeader>
  <CardContent>
    <ImageUpload
      currentImageUrl={business?.logo_url}
      onImageUploaded={handleLogoUploaded}
      bucket="business-logos"
      folder={business?.id}
      maxSizeInMB={3}
      previewSize="lg"
      buttonText="Cambiar logo"
    />
  </CardContent>
</Card>
*/
