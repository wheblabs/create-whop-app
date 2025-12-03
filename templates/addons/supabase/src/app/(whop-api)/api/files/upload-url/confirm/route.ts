import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken } from '~/lib/whop'
// NOTE: Uncomment when using with database
// import { db } from '~/db'
// import { files } from '~/db/schema'

// ============================================================================
// CONFIRM UPLOAD ENDPOINT
// ============================================================================
// After the client uploads a file directly to Supabase Storage using the
// presigned URL, they call this endpoint to create the database record.
//
// Flow:
// 1. Client calls POST /api/files/upload-url → gets presigned URL
// 2. Client uploads file directly to Supabase Storage via PUT to the URL
// 3. Client calls POST /api/files/upload-url/confirm → creates DB record
// ============================================================================

interface ConfirmUploadRequest {
  /** The storage path returned from /api/files/upload-url */
  path: string
  /** Original filename for display */
  filename: string
  /** File size in bytes */
  fileSize: number
  /** MIME type */
  mimeType: string
  /** Optional: entity this file belongs to (e.g., productId) */
  entityId?: string
  /** Optional: entity type (e.g., 'product', 'user') */
  entityType?: string
}

/**
 * POST /api/files/upload-url/confirm
 *
 * Confirm that a file was successfully uploaded via presigned URL
 * and create the database record.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await verifyUserToken(req.headers)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ConfirmUploadRequest = await req.json()
    const { path, filename, fileSize, mimeType, entityId, entityType } = body

    // Validate required fields
    if (!path || !filename || !fileSize) {
      return NextResponse.json(
        {
          error: 'Missing required fields: path, filename, fileSize',
          hint: 'These values should come from the upload-url response and the original file',
        },
        { status: 400 }
      )
    }

    // TODO: Optionally verify the file exists in storage before creating record
    // const supabase = getStorageClient()
    // const { data } = await supabase.storage.from(STORAGE_BUCKET).list(path.split('/').slice(0, -1).join('/'))

    // Create database record
    // NOTE: Uncomment and adjust to your schema
    /*
    const [newFile] = await db
      .insert(files)
      .values({
        storagePath: path,
        filename,
        originalFilename: filename,
        fileSize,
        mimeType,
        entityId,
        entityType,
        uploadedBy: userId,
      })
      .returning()
    
    return NextResponse.json({ file: newFile })
    */

    // Placeholder response - replace with your database implementation
    return NextResponse.json({
      file: {
        id: crypto.randomUUID(),
        storagePath: path,
        filename,
        originalFilename: filename,
        fileSize,
        mimeType,
        entityId,
        entityType,
        uploadedBy: userId,
        createdAt: new Date().toISOString(),
      },
      message: 'File upload confirmed. TODO: Implement database record creation.',
    })
  } catch (error) {
    console.error('Error confirming file upload:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm upload' },
      { status: 500 }
    )
  }
}

