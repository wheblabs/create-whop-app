import { NextRequest, NextResponse } from 'next/server'
import { verifyUserToken, checkAccess } from '~/lib/whop'
import { db } from '~/db'
import { products } from '~/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import {
  generateRequestId,
  createRequestLogger,
  Errors,
  parsePagination,
  paginatedResponse,
} from '~/lib/api-utils'

// ============================================================================
// PRODUCTS API
// ============================================================================
// Example CRUD API for products with WhopShip best practices:
// - Structured logging for CloudWatch
// - Pagination
// - Image validation (prevent base64 data URLs that cause payload issues)
// - Proper error handling
// ============================================================================

// Maximum allowed image URL length to prevent storing base64 data URLs
const MAX_IMAGE_URL_LENGTH = 2048

/**
 * Validate that images are URLs, not base64 data
 * Base64 data URLs will cause Lambda payload limit errors
 */
function validateImageUrls(images: unknown): string[] {
  if (!images || !Array.isArray(images)) return []

  return images.filter((img): img is string => {
    if (typeof img !== 'string') return false

    // Reject base64 data URLs - they're too large for Lambda
    if (img.startsWith('data:')) {
      console.warn('Rejecting base64 data URL - use presigned URL upload instead')
      return false
    }

    // Reject overly long URLs
    if (img.length > MAX_IMAGE_URL_LENGTH) {
      console.warn(`Rejecting URL longer than ${MAX_IMAGE_URL_LENGTH} chars`)
      return false
    }

    // Must be a valid HTTP(S) URL
    return img.startsWith('http://') || img.startsWith('https://')
  })
}

/**
 * GET /api/products
 * List products for an experience
 */
export async function GET(req: NextRequest) {
  const requestId = generateRequestId()
  const logger = createRequestLogger('GET /api/products', requestId)
  const startTime = Date.now()

  try {
    // Get experienceId from query params
    const { searchParams } = new URL(req.url)
    const experienceId = searchParams.get('experienceId')

    if (!experienceId) {
      return Errors.badRequest('experienceId is required', requestId)
    }

    // Verify authentication
    const { userId } = await verifyUserToken(req.headers)
    if (!userId) {
      return Errors.unauthorized(requestId)
    }

    // Check access level
    const access = await checkAccess(experienceId, userId)
    logger.info('Access checked', { accessLevel: access.accessLevel })

    // Parse pagination
    const pagination = parsePagination(searchParams)

    // Fetch products
    const productsList = await db
      .select()
      .from(products)
      .where(
        access.accessLevel === 'admin'
          ? eq(products.experienceId, experienceId)
          : and(eq(products.experienceId, experienceId), eq(products.status, 'active'))
      )
      .orderBy(desc(products.createdAt))
      .limit(pagination.limit)
      .offset(pagination.offset)

    // Get total count (simplified - for production, use a separate count query)
    const total = productsList.length < pagination.limit ? pagination.offset + productsList.length : pagination.offset + pagination.limit + 1

    logger.info('Products fetched', {
      count: productsList.length,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json(paginatedResponse(productsList, total, pagination))
  } catch (error) {
    logger.error('Failed to fetch products', error)
    return Errors.internal(requestId)
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const logger = createRequestLogger('POST /api/products', requestId)

  try {
    // Verify authentication
    const { userId } = await verifyUserToken(req.headers)
    if (!userId) {
      return Errors.unauthorized(requestId)
    }

    const body = await req.json()
    const { experienceId, title, description, price, type, images } = body

    // Validate required fields
    if (!experienceId || !title || price === undefined) {
      return Errors.badRequest('experienceId, title, and price are required', requestId)
    }

    // Check admin access
    const access = await checkAccess(experienceId, userId)
    if (access.accessLevel !== 'admin') {
      return Errors.forbidden(requestId)
    }

    // Validate and filter images (prevent base64 data URLs)
    const validatedImages = validateImageUrls(images)
    if (images?.length > 0 && validatedImages.length === 0) {
      return Errors.badRequest(
        'Invalid images. Use presigned URL upload and provide HTTPS URLs, not base64 data URLs.',
        requestId
      )
    }

    // Create product
    const [newProduct] = await db
      .insert(products)
      .values({
        experienceId,
        title,
        description: description || null,
        price: String(price),
        type: type || 'digital',
        images: validatedImages,
      })
      .returning()

    logger.info('Product created', { productId: newProduct.id })

    return NextResponse.json({ product: newProduct }, { status: 201 })
  } catch (error) {
    logger.error('Failed to create product', error)
    return Errors.internal(requestId)
  }
}

