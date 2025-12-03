import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken, checkAccess } from '~/lib/whop'
import { db } from '~/db'
import { products } from '~/db/schema'
import { eq } from 'drizzle-orm'
import { generateRequestId, createRequestLogger, Errors, validateUUID } from '~/lib/api-utils'

// ============================================================================
// INDIVIDUAL PRODUCT API
// ============================================================================
// CRUD operations for a single product by ID
// ============================================================================

type RouteContext = { params: Promise<{ id: string }> }

// Maximum allowed image URL length
const MAX_IMAGE_URL_LENGTH = 2048

/**
 * Validate that images are URLs, not base64 data
 */
function validateImageUrls(images: unknown): string[] {
  if (!images || !Array.isArray(images)) return []

  return images.filter((img): img is string => {
    if (typeof img !== 'string') return false
    if (img.startsWith('data:')) return false
    if (img.length > MAX_IMAGE_URL_LENGTH) return false
    return img.startsWith('http://') || img.startsWith('https://')
  })
}

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const requestId = generateRequestId()
  const logger = createRequestLogger('GET /api/products/[id]', requestId)

  try {
    const { id } = await context.params

    // Validate UUID
    const uuidError = validateUUID(id, 'product id', requestId)
    if (uuidError) return uuidError

    // Fetch product
    const [product] = await db.select().from(products).where(eq(products.id, id))

    if (!product) {
      return Errors.notFound('Product', requestId)
    }

    // For active products, allow public access (storefront)
    if (product.status === 'active') {
      return NextResponse.json({ product })
    }

    // For non-active products, verify authentication
    const { userId } = await verifyUserToken(req.headers)
    if (!userId) {
      return Errors.unauthorized(requestId)
    }

    // Verify admin access for non-active products
    const access = await checkAccess(product.experienceId, userId)
    if (access.accessLevel !== 'admin') {
      return Errors.forbidden(requestId)
    }

    logger.info('Product fetched', { productId: id })
    return NextResponse.json({ product })
  } catch (error) {
    logger.error('Failed to fetch product', error)
    return Errors.internal(requestId)
  }
}

/**
 * PATCH /api/products/[id]
 * Update a product
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const requestId = generateRequestId()
  const logger = createRequestLogger('PATCH /api/products/[id]', requestId)

  try {
    const { id } = await context.params

    // Validate UUID
    const uuidError = validateUUID(id, 'product id', requestId)
    if (uuidError) return uuidError

    // Verify authentication
    const { userId } = await verifyUserToken(req.headers)
    if (!userId) {
      return Errors.unauthorized(requestId)
    }

    // Fetch existing product
    const [existingProduct] = await db.select().from(products).where(eq(products.id, id))

    if (!existingProduct) {
      return Errors.notFound('Product', requestId)
    }

    // Verify admin access
    const access = await checkAccess(existingProduct.experienceId, userId)
    if (access.accessLevel !== 'admin') {
      return Errors.forbidden(requestId)
    }

    const body = await req.json()
    const { title, description, price, type, status, images } = body

    // Build update object
    const updates: Partial<typeof existingProduct> = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (price !== undefined) updates.price = String(price)
    if (type !== undefined) updates.type = type
    if (status !== undefined) updates.status = status

    // Validate images if provided
    if (images !== undefined) {
      const validatedImages = validateImageUrls(images)
      if (images.length > 0 && validatedImages.length === 0) {
        return Errors.badRequest(
          'Invalid images. Use presigned URL upload and provide HTTPS URLs.',
          requestId
        )
      }
      updates.images = validatedImages
    }

    // Update product
    const [updatedProduct] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning()

    logger.info('Product updated', { productId: id })
    return NextResponse.json({ product: updatedProduct })
  } catch (error) {
    logger.error('Failed to update product', error)
    return Errors.internal(requestId)
  }
}

/**
 * DELETE /api/products/[id]
 * Delete a product
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const requestId = generateRequestId()
  const logger = createRequestLogger('DELETE /api/products/[id]', requestId)

  try {
    const { id } = await context.params

    // Validate UUID
    const uuidError = validateUUID(id, 'product id', requestId)
    if (uuidError) return uuidError

    // Verify authentication
    const { userId } = await verifyUserToken(req.headers)
    if (!userId) {
      return Errors.unauthorized(requestId)
    }

    // Fetch existing product
    const [existingProduct] = await db.select().from(products).where(eq(products.id, id))

    if (!existingProduct) {
      return Errors.notFound('Product', requestId)
    }

    // Verify admin access
    const access = await checkAccess(existingProduct.experienceId, userId)
    if (access.accessLevel !== 'admin') {
      return Errors.forbidden(requestId)
    }

    // Delete product (files will cascade delete due to FK constraint)
    await db.delete(products).where(eq(products.id, id))

    logger.info('Product deleted', { productId: id })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to delete product', error)
    return Errors.internal(requestId)
  }
}

