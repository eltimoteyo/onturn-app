import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export type BucketName = 'avatars' | 'business-logos' | 'documents'

interface UploadOptions {
  bucket: BucketName
  folder?: string
  fileName?: string
  maxSizeInMB?: number
  allowedTypes?: string[]
}

interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo a subir
 * @param options - Opciones de subida
 * @returns URL pública de la imagen subida
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const {
    bucket,
    folder,
    fileName,
    maxSizeInMB = 2,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  } = options

  try {
    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        `Tipo de archivo no permitido. Formatos válidos: ${allowedTypes
          .map(t => t.split('/')[1])
          .join(', ')}`
      )
    }

    // Validar tamaño
    const maxSizeBytes = maxSizeInMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      throw new Error(`El archivo es demasiado grande. Máximo: ${maxSizeInMB}MB`)
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const uniqueFileName = fileName || `${timestamp}-${randomString}.${fileExt}`

    // Construir la ruta completa
    const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(error.message)
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path
    }
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return {
      url: '',
      path: '',
      error: error.message || 'Error al subir la imagen'
    }
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param bucket - Nombre del bucket
 * @param path - Ruta del archivo en el bucket
 */
export async function deleteImage(
  bucket: BucketName,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting image:', error)
    return {
      success: false,
      error: error.message || 'Error al eliminar la imagen'
    }
  }
}

/**
 * Extrae la ruta del archivo desde una URL pública de Supabase
 * @param url - URL pública de Supabase Storage
 * @returns Ruta del archivo o null
 */
export function extractPathFromUrl(url: string): string | null {
  if (!url) return null

  try {
    // Formato: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
    const parts = url.split('/object/public/')
    if (parts.length !== 2) return null

    const [bucketAndPath] = parts[1].split('/')
    const path = parts[1].substring(bucketAndPath.length + 1)
    
    return path || null
  } catch {
    return null
  }
}

/**
 * Actualiza una imagen (elimina la anterior si existe y sube la nueva)
 * @param file - Nuevo archivo
 * @param options - Opciones de subida
 * @param oldUrl - URL de la imagen anterior (opcional)
 */
export async function updateImage(
  file: File,
  options: UploadOptions,
  oldUrl?: string
): Promise<UploadResult> {
  try {
    // Subir nueva imagen
    const uploadResult = await uploadImage(file, options)

    if (uploadResult.error) {
      return uploadResult
    }

    // Eliminar imagen anterior si existe
    if (oldUrl) {
      const oldPath = extractPathFromUrl(oldUrl)
      if (oldPath) {
        await deleteImage(options.bucket, oldPath)
      }
    }

    return uploadResult
  } catch (error: any) {
    console.error('Error updating image:', error)
    return {
      url: '',
      path: '',
      error: error.message || 'Error al actualizar la imagen'
    }
  }
}

/**
 * Comprime y optimiza una imagen a formato WebP (máxima compresión)
 * @param file - Archivo original
 * @param options - Opciones de compresión
 * @returns Promise con el archivo comprimido en WebP
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}
): Promise<File> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    format = 'webp' // WebP por defecto para mejor compresión
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calcular nuevas dimensiones manteniendo aspect ratio
        const aspectRatio = width / height

        if (width > maxWidth) {
          width = maxWidth
          height = Math.round(width / aspectRatio)
        }

        if (height > maxHeight) {
          height = maxHeight
          width = Math.round(height * aspectRatio)
        }

        // Redondear a números enteros
        canvas.width = Math.round(width)
        canvas.height = Math.round(height)

        const ctx = canvas.getContext('2d', { 
          alpha: format === 'png', // Solo alpha para PNG
          willReadFrequently: false 
        })
        
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'))
          return
        }

        // Configurar para mejor calidad de renderizado
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Fondo blanco para JPG/WebP (evitar transparencia)
        if (format !== 'png') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Seleccionar MIME type según formato
        const mimeType = format === 'webp' 
          ? 'image/webp' 
          : format === 'jpeg' 
          ? 'image/jpeg' 
          : 'image/png'

        // Convertir a Blob con compresión
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'))
              return
            }

            // Generar nombre con extensión correcta
            const originalName = file.name.split('.')[0]
            const extension = format === 'webp' ? 'webp' : format === 'jpeg' ? 'jpg' : 'png'
            const fileName = `${originalName}-optimized.${extension}`

            const compressedFile = new File([blob], fileName, {
              type: mimeType,
              lastModified: Date.now()
            })

            // Log de reducción de tamaño (solo en desarrollo)
            if (process.env.NODE_ENV === 'development') {
              const reduction = Math.round((1 - blob.size / file.size) * 100)
              console.log(`📦 Imagen optimizada: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB (${reduction}% reducción)`)
            }

            resolve(compressedFile)
          },
          mimeType,
          quality
        )
      }

      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Comprime una imagen de forma agresiva para avatares (máximo 200KB)
 * Ideal para perfiles de usuario donde el tamaño es crítico
 */
export async function compressAvatar(file: File): Promise<File> {
  let quality = 0.85
  let compressed = await compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality,
    format: 'webp'
  })

  // Si sigue siendo muy grande, reducir calidad iterativamente
  while (compressed.size > 200 * 1024 && quality > 0.5) {
    quality -= 0.1
    compressed = await compressImage(file, {
      maxWidth: 400,
      maxHeight: 400,
      quality,
      format: 'webp'
    })
  }

  return compressed
}

/**
 * Comprime una imagen de logo (máximo 500KB)
 * Mantiene mejor calidad para marcas
 */
export async function compressLogo(file: File): Promise<File> {
  // Si es SVG, no comprimir
  if (file.type === 'image/svg+xml') {
    return file
  }

  let quality = 0.9
  let compressed = await compressImage(file, {
    maxWidth: 800,
    maxHeight: 800,
    quality,
    format: 'webp'
  })

  // Reducir si es necesario
  while (compressed.size > 500 * 1024 && quality > 0.6) {
    quality -= 0.1
    compressed = await compressImage(file, {
      maxWidth: 800,
      maxHeight: 800,
      quality,
      format: 'webp'
    })
  }

  return compressed
}

/**
 * Helpers para casos de uso específicos
 */

// Subir avatar de usuario (automáticamente comprimido a WebP)
export async function uploadUserAvatar(file: File, userId: string) {
  // Comprimir avatar de forma agresiva
  const compressedFile = await compressAvatar(file)
  
  return uploadImage(compressedFile, {
    bucket: 'avatars',
    folder: userId,
    maxSizeInMB: 2
  })
}

// Subir logo de negocio (optimizado para WebP, excepto SVG)
export async function uploadBusinessLogo(file: File, businessId: string) {
  // Si es SVG, subir sin comprimir
  const fileToUpload = file.type === 'image/svg+xml' 
    ? file 
    : await compressLogo(file)
  
  return uploadImage(fileToUpload, {
    bucket: 'business-logos',
    folder: businessId,
    maxSizeInMB: 3,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
  })
}

// Subir documento (sin comprimir para mantener calidad original)
export async function uploadDocument(file: File, userId: string) {
  return uploadImage(file, {
    bucket: 'documents',
    folder: userId,
    maxSizeInMB: 5,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  })
}
