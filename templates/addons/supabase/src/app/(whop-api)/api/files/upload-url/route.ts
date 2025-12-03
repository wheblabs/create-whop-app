import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from '~/lib/whop'
import {
  getPresignedUploadUrl,
  STORAGE_BUCKET,
  MAX_FILE_SIZE,
  PRESIGNED_URL_THRESHOLD,
  isValidFileType,
  formatFileSize,
} from '~/lib/storage'

// ============================================================================
// PRESIGNED UPLOAD URL ENDPOINT
// ============================================================================
// This endpoint generates a presigned URL for direct client-side uploads
// to Supabase Storage, bypassing the Lambda 6MB payload limit.
//
// Why this is necessary on WhopShip:
// - AWS Lambda has a 6MB request/response payload limit
// - Files larger than ~5MB will fail with "Request Entity Too Large"
// - Presigned URLs allow the client to upload directly to storage
// ============================================================================

interface UploadUrlRequest {
  /** Folder to upload to (e.g., productId, userId, or any grouping) */
  folder: string
  /** Original filename */
  filename: string
  /** File size in bytes */
  fileSize: number
  /** MIME type of the file */
  mimeType?: string
}

/**
 * POST /api/files/upload-url
 *
 * Get a presigned URL for direct file upload to Supabase Storage.
 * Use this for files larger than 5MB to bypass Lambda payload limits.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await verifyUserToken(req.headers)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UploadUrlRequest = await req.json()
    const { folder, filename, fileSize, mimeType } = body

    // Validate required fields
    if (!folder || !filename || !fileSize) {
      return NextResponse.json(
        {
          error: 'Missing required fields: folder, filename, fileSize',
          hint: 'Include the folder to organize files, the filename, and fileSize in bytes',
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 }
      )
    }

    // Validate file type if provided
    if (mimeType && !isValidFileType(mimeType)) {
      return NextResponse.json(
        {
          error: 'Invalid file type',
          allowedTypes: 'PDF, ZIP, MP4, WebM, MP3, WAV, JPEG, PNG, WebP, GIF',
        },
        { status: 400 }
      )
    }

    // Generate presigned upload URL
    const result = await getPresignedUploadUrl(STORAGE_BUCKET, folder, filename)

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      path: result.path,
      publicUrl: result.publicUrl,
      expiresIn: 300, // 5 minutes
      // Include this hint for the client
      uploadMethod: 'PUT',
      uploadHeaders: {
        'Content-Type': mimeType || 'application/octet-stream',
        // For some Supabase versions, you may need this header
        'x-upsert': 'false',
      },
    })
  } catch (error) {
    console.error('Error generating presigned upload URL:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}

