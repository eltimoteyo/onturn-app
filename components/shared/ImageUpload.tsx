'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { 
  uploadImage, 
  compressImage, 
  compressAvatar, 
  compressLogo,
  type BucketName 
} from '@/lib/services/storage'

interface ImageUploadProps {
  /** URL de la imagen actual (opcional) */
  currentImageUrl?: string
  /** Callback cuando se sube exitosamente una imagen */
  onImageUploaded: (url: string, path: string) => void
  /** Bucket de Supabase donde se subirá */
  bucket: BucketName
  /** Carpeta dentro del bucket (ej. userId, businessId) */
  folder?: string
  /** Tamaño máximo en MB */
  maxSizeInMB?: number
  /** Ancho y alto en pixels para el preview */
  previewSize?: 'sm' | 'md' | 'lg'
  /** Texto del botón */
  buttonText?: string
  /** Forma del preview (circular para avatares) */
  shape?: 'square' | 'circle'
  /** Comprimir imagen antes de subir */
  compress?: boolean
  /** Tipo de compresión: 'avatar' (más agresiva) | 'logo' (calidad media) | 'custom' */
  compressionType?: 'avatar' | 'logo' | 'custom'
  /** Ancho máximo para compresión custom */
  compressMaxWidth?: number
  /** Calidad para compresión custom (0-1) */
  compressQuality?: number
  /** Tipos de archivo permitidos */
  allowedTypes?: string[]
}

const sizeClasses = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-48 h-48'
}

export function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  bucket,
  folder,
  maxSizeInMB = 2,
  previewSize = 'md',
  compressionType = 'avatar',
  compressMaxWidth = 1200,
  compressQuality = 0.85,
  buttonText = 'Subir imagen',
  shape = 'square',
  compress = true,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { success, error: showError } = useToast()

  const handleFileSelect = async (file: File) => {
    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      showError(
        'Tipo de archivo no válido',
        `Formatos permitidos: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
      )
      return
    }

    // Validar tamaño
    const maxBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxBytes) {
      showError('Archivo muy grande', `El tamaño máximo es ${maxSizeInMB}MB`)
      return
    }

    try {
      setUploading(true)

      // Crear preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Comprimir imagen si está habilitado
      let fileToUpload = file
      if (compress && file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
        try {
          fileToUpload = await compressImage(file, compressMaxWidth, compressQuality)
        } catch (err) {
          console.warn('Error al comprimir, subiendo original:', err)
        }
      }

      // Subir a Supabase
      const result = await uploadImage(fileToUpload, {
        bucket,
        folder,
        maxSizeInMB,
        allowedTypes
      })

      if (result.error) {
        throw new Error(result.error)
      }

      onImageUploaded(result.url, result.path)
      success('¡Imagen subida!', 'La imagen se guardó correctamente')
    } catch (err: any) {
      console.error('Error uploading:', err)
      showError('Error al subir', err.message || 'Inténtalo nuevamente')
      setPreview(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview ? (
        <div className="relative inline-block">
          <div
            className={cn(
              sizeClasses[previewSize],
              shape === 'circle' ? 'rounded-full' : 'rounded-xl',
              'overflow-hidden border-2 border-gray-200 bg-gray-100'
            )}
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              sizes="(max-width: 640px) 20vw, 32vw"
              className="object-cover"
              unoptimized
            />
          </div>
          {!uploading && (
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
              type="button"
            >
              <X size={16} />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
              <Loader2 className="animate-spin text-white" size={24} />
            </div>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed rounded-xl cursor-pointer transition-all',
            sizeClasses[previewSize],
            dragActive
              ? 'border-primary bg-primary/5 scale-105'
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50',
            'flex flex-col items-center justify-center gap-2 p-4'
          )}
        >
          {uploading ? (
            <Loader2 className="animate-spin text-primary" size={32} />
          ) : (
            <>
              <ImageIcon className="text-gray-400" size={32} />
              <p className="text-xs text-gray-500 text-center font-medium">
                {dragActive ? '¡Suelta aquí!' : 'Arrastra o click'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleChange}
        className="hidden"
      />

      {/* Botón de subida */}
      {!preview && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 text-center">
        Máximo {maxSizeInMB}MB • {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
      </p>
    </div>
  )
}
