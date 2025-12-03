'use client'

import { useState, useRef, useCallback } from 'react'

// ============================================================================
// IMAGE UPLOADER COMPONENT
// ============================================================================
// This component handles image uploads with automatic presigned URL usage
// for files larger than the Lambda payload limit (~5MB).
//
// For WhopShip deployments, direct file uploads through Lambda will fail
// for files larger than ~5MB. This component automatically:
// 1. Gets a presigned URL from your API
// 2. Uploads directly to Supabase Storage (bypassing Lambda)
// 3. Returns the public URL for display/storage
// ============================================================================

// Lambda payload limit threshold - use presigned URLs above this
const PRESIGNED_URL_THRESHOLD = 5 * 1024 * 1024 // 5MB

interface ImageUploaderProps {
  /** Current list of image URLs */
  images: string[]
  /** Callback when images change */
  onImagesChange: (images: string[]) => void
  /** Folder to organize images in storage */
  folder: string
  /** Maximum number of images */
  maxImages?: number
  /** Maximum file size in bytes */
  maxFileSize?: number
}

export function ImageUploader({
  images,
  onImagesChange,
  folder,
  maxImages = 8,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const uploadImage = async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error(`${file.name} is not an image`)
    }

    // Validate file size
    if (file.size > maxFileSize) {
      throw new Error(`${file.name} is too large. Max size is ${Math.round(maxFileSize / 1024 / 1024)}MB`)
    }

    // Use presigned URL for large files to bypass Lambda payload limit
    // Step 1: Get presigned upload URL
    const urlRes = await fetch('/api/files/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folder,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }),
      credentials: 'include',
    })

    if (!urlRes.ok) {
      const data = await urlRes.json()
      throw new Error(data.error || `Failed to prepare upload for ${file.name}`)
    }

    const { uploadUrl, publicUrl, uploadHeaders } = await urlRes.json()

    // Step 2: Upload directly to Supabase Storage
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: uploadHeaders || {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })

    if (!uploadRes.ok) {
      throw new Error(`Failed to upload ${file.name}`)
    }

    return publicUrl
  }

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))

      if (imageFiles.length === 0) {
        setError('No valid image files selected')
        return
      }

      const remainingSlots = maxImages - images.length
      if (imageFiles.length > remainingSlots) {
        setError(`Can only add ${remainingSlots} more image${remainingSlots !== 1 ? 's' : ''}`)
        imageFiles.splice(remainingSlots)
      }

      setUploading(true)
      setError(null)
      setUploadProgress(`Uploading 0/${imageFiles.length}...`)

      const newUrls: string[] = []

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        setUploadProgress(`Uploading ${i + 1}/${imageFiles.length}: ${file.name}`)

        try {
          const url = await uploadImage(file)
          newUrls.push(url)
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err)
          setError(err instanceof Error ? err.message : `Failed to upload ${file.name}`)
        }
      }

      if (newUrls.length > 0) {
        onImagesChange([...images, ...newUrls])
      }

      setUploading(false)
      setUploadProgress(null)
    },
    [images, onImagesChange, maxImages, folder]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
      }
    },
    [processFiles]
  )

  const removeImage = useCallback(
    (index: number) => {
      const newImages = [...images]
      newImages.splice(index, 1)
      onImagesChange(newImages)
    },
    [images, onImagesChange]
  )

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">Product Images</label>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800">
              <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
              <span className="text-gray-400">{uploadProgress || 'Uploading images...'}</span>
            </div>
          ) : (
            <>
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-300">Drag and drop images here, or click to select</p>
              <p className="text-gray-500 text-sm mt-1">
                PNG, JPG, WebP up to {Math.round(maxFileSize / 1024 / 1024)}MB • Max {maxImages} images
              </p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>
      )}
    </div>
  )
}

