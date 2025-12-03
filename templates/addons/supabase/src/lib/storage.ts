import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// STORAGE UTILITIES FOR WHOPSHIP
// ============================================================================
// AWS Lambda has a 6MB payload limit. To upload files larger than ~5MB,
// you MUST use presigned URLs to upload directly to Supabase Storage,
// bypassing the Lambda function entirely.
//
// Flow for large files:
// 1. Client requests presigned upload URL from your API
// 2. Client uploads directly to Supabase Storage using the presigned URL
// 3. Client confirms the upload, your API creates the database record
// ============================================================================

// Constants
export const STORAGE_BUCKET = 'files' // Change to your bucket name
export const IMAGES_BUCKET = 'images' // Change to your images bucket name
export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB (Supabase free tier limit)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB for images

// File size threshold for using presigned URLs vs direct upload
// Lambda payload limit is 6MB, so we use 5MB as a safe threshold
export const PRESIGNED_URL_THRESHOLD = 5 * 1024 * 1024 // 5MB

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  ...ALLOWED_IMAGE_TYPES,
]

// Cached Supabase client instance (module-level singleton for Lambda reuse)
let cachedClient: SupabaseClient | null = null

/**
 * Get Supabase Storage client
 * Uses service role key for server-side operations
 */
export function getStorageClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Prefer service role key for storage operations, fall back to anon key
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)')
  }

  cachedClient = createClient(supabaseUrl, serviceKey)
  return cachedClient
}

// ============================================================================
// PRESIGNED URL FUNCTIONS
// ============================================================================

export interface PresignedUploadResult {
  /** The presigned URL for PUT upload */
  uploadUrl: string
  /** The storage path where the file will be stored */
  path: string
  /** The upload token (for some Supabase versions) */
  token: string
  /** The public URL after upload completes */
  publicUrl: string
}

/**
 * Generate a presigned upload URL for direct client-side uploads
 * This bypasses the Lambda 6MB payload limit by allowing direct upload to Supabase Storage
 *
 * @param bucket - Storage bucket name
 * @param folder - Folder path (e.g., productId or 'uploads')
 * @param filename - Original filename
 * @param expiresIn - Expiration time in seconds (default: 5 minutes)
 */
export async function getPresignedUploadUrl(
  bucket: string,
  folder: string,
  filename: string,
  expiresIn = 300
): Promise<PresignedUploadResult> {
  const supabase = getStorageClient()

  // Generate unique storage path
  const timestamp = Date.now()
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `${folder}/${timestamp}-${safeFilename}`

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(storagePath)

  if (error || !data) {
    throw new Error(`Failed to generate signed upload URL: ${error?.message || 'Unknown error'}`)
  }

  // Get the public URL for the file (will be valid after upload)
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath)

  return {
    uploadUrl: data.signedUrl,
    path: storagePath,
    token: data.token,
    publicUrl: publicUrlData.publicUrl,
  }
}

/**
 * Generate a signed download URL for private files
 *
 * @param bucket - Storage bucket name
 * @param path - Storage path
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export async function getSignedDownloadUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  const supabase = getStorageClient()

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed download URL: ${error?.message || 'Unknown error'}`)
  }

  return data.signedUrl
}

// ============================================================================
// DIRECT UPLOAD FUNCTIONS (for small files < 5MB)
// ============================================================================

export interface UploadResult {
  path: string
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string | null
  publicUrl: string
}

/**
 * Upload a file directly to Supabase Storage
 * Use this only for files smaller than PRESIGNED_URL_THRESHOLD (5MB)
 *
 * @param bucket - Storage bucket name
 * @param folder - Folder path
 * @param file - File to upload
 */
export async function uploadFile(bucket: string, folder: string, file: File): Promise<UploadResult> {
  const supabase = getStorageClient()

  const originalFilename = file.name
  const fileSize = file.size
  const mimeType = file.type || null

  // Validate file size for direct upload
  if (fileSize > PRESIGNED_URL_THRESHOLD) {
    throw new Error(
      `File too large for direct upload (${Math.round(fileSize / 1024 / 1024)}MB). ` +
        `Use presigned URL upload for files larger than ${PRESIGNED_URL_THRESHOLD / 1024 / 1024}MB.`
    )
  }

  // Generate unique filename
  const timestamp = Date.now()
  const safeFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storagePath = `${folder}/${timestamp}-${safeFilename}`

  const fileData = await file.arrayBuffer()

  const { error } = await supabase.storage.from(bucket).upload(storagePath, fileData, {
    contentType: mimeType || 'application/octet-stream',
    upsert: false,
  })

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath)

  return {
    path: storagePath,
    filename: safeFilename,
    originalFilename,
    fileSize,
    mimeType,
    publicUrl: publicUrlData.publicUrl,
  }
}

// ============================================================================
// FILE MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = getStorageClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Delete multiple files from storage
 */
export async function deleteFiles(bucket: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return

  const supabase = getStorageClient()

  const { error } = await supabase.storage.from(bucket).remove(paths)

  if (error) {
    throw new Error(`Failed to delete files: ${error.message}`)
  }
}

/**
 * List files in a folder
 */
export async function listFiles(bucket: string, folder: string): Promise<string[]> {
  const supabase = getStorageClient()

  const { data, error } = await supabase.storage.from(bucket).list(folder)

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`)
  }

  return data?.map((f) => `${folder}/${f.name}`) || []
}

/**
 * Delete all files in a folder
 */
export async function deleteFolderContents(bucket: string, folder: string): Promise<void> {
  const files = await listFiles(bucket, folder)
  if (files.length > 0) {
    await deleteFiles(bucket, files)
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string, allowedTypes: string[] = ALLOWED_FILE_TYPES): boolean {
  return allowedTypes.includes(mimeType)
}

/**
 * Validate image type
 */
export function isValidImageType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType)
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number = MAX_FILE_SIZE): boolean {
  return size > 0 && size <= maxSize
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

