import { NextResponse } from 'next/server'

// ============================================================================
// API UTILITIES FOR WHOPSHIP
// ============================================================================
// Consistent error handling, logging, and response helpers for API routes.
// Designed for Lambda execution where structured logging is essential.
// ============================================================================

// ============================================================================
// LOGGING
// ============================================================================
// Structured logging for Lambda/CloudWatch - logs are JSON for easy querying

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

/**
 * Generate a unique request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Create a logger with consistent request context
 * Use this at the start of each API route for traceable logs
 */
export function createRequestLogger(route: string, requestId: string) {
  const logBase = (level: LogLevel, message: string, context?: LogContext) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      route,
      requestId,
      message,
      ...context,
    }

    // In Lambda, console.log outputs to CloudWatch
    // Use different console methods for log level filtering
    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(logEntry))
        break
      case 'info':
        console.info(JSON.stringify(logEntry))
        break
      case 'warn':
        console.warn(JSON.stringify(logEntry))
        break
      case 'error':
        console.error(JSON.stringify(logEntry))
        break
    }
  }

  return {
    debug: (message: string, context?: LogContext) => logBase('debug', message, context),
    info: (message: string, context?: LogContext) => logBase('info', message, context),
    warn: (message: string, context?: LogContext) => logBase('warn', message, context),
    error: (message: string, error?: unknown, context?: LogContext) => {
      const errorContext: LogContext = { ...context }
      if (error instanceof Error) {
        errorContext.errorName = error.name
        errorContext.errorMessage = error.message
        errorContext.errorStack = error.stack
      } else if (error) {
        errorContext.error = String(error)
      }
      logBase('error', message, errorContext)
    },
  }
}

// ============================================================================
// ERROR RESPONSE HELPERS
// ============================================================================

export interface ApiError {
  error: string
  code?: string
  details?: unknown
  requestId?: string
}

/**
 * Create a standardized error response
 */
export function errorResponse(message: string, status: number, requestId?: string, code?: string): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      code,
      requestId,
    },
    { status }
  )
}

/**
 * Common error responses
 */
export const Errors = {
  unauthorized: (requestId?: string) => errorResponse('Unauthorized', 401, requestId, 'UNAUTHORIZED'),

  forbidden: (requestId?: string) => errorResponse('Forbidden', 403, requestId, 'FORBIDDEN'),

  notFound: (resource: string, requestId?: string) =>
    errorResponse(`${resource} not found`, 404, requestId, 'NOT_FOUND'),

  badRequest: (message: string, requestId?: string) => errorResponse(message, 400, requestId, 'BAD_REQUEST'),

  validationError: (message: string, requestId?: string) =>
    errorResponse(message, 422, requestId, 'VALIDATION_ERROR'),

  internal: (requestId?: string) =>
    errorResponse('An unexpected error occurred', 500, requestId, 'INTERNAL_ERROR'),

  rateLimited: (requestId?: string) => errorResponse('Too many requests', 429, requestId, 'RATE_LIMITED'),

  payloadTooLarge: (requestId?: string) =>
    errorResponse(
      'Request payload too large. For files >5MB, use presigned URL upload.',
      413,
      requestId,
      'PAYLOAD_TOO_LARGE'
    ),
}

// ============================================================================
// UUID VALIDATION
// ============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validate a UUID and return an error response if invalid
 * Use this for route parameters that should be UUIDs
 */
export function validateUUID(id: string, fieldName: string, requestId?: string): NextResponse<ApiError> | null {
  if (!id || !UUID_REGEX.test(id)) {
    return Errors.badRequest(`Invalid ${fieldName}`, requestId)
  }
  return null
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

export interface PaginationParams {
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Parse pagination params from URL search params
 */
export function parsePagination(searchParams: URLSearchParams, defaultLimit = 20, maxLimit = 100): PaginationParams {
  let limit = parseInt(searchParams.get('limit') || String(defaultLimit), 10)
  let offset = parseInt(searchParams.get('offset') || '0', 10)

  // Validate and clamp values
  limit = Math.min(Math.max(1, limit), maxLimit)
  offset = Math.max(0, offset)

  return { limit, offset }
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(items: T[], total: number, params: PaginationParams): PaginatedResponse<T> {
  return {
    items,
    pagination: {
      total,
      limit: params.limit,
      offset: params.offset,
      hasMore: params.offset + items.length < total,
    },
  }
}

// ============================================================================
// REQUEST TIMING
// ============================================================================

/**
 * Time an async operation and log the duration
 */
export async function withTiming<T>(
  operation: string,
  fn: () => Promise<T>,
  logger?: ReturnType<typeof createRequestLogger>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    logger?.debug(`${operation} completed`, { durationMs: duration })
    return result
  } catch (error) {
    const duration = Date.now() - start
    logger?.error(`${operation} failed`, error, { durationMs: duration })
    throw error
  }
}

// ============================================================================
// SAFE JSON PARSING
// ============================================================================

/**
 * Safely parse JSON from a string, returning null on error
 */
export function safeParseJson<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

// ============================================================================
// CACHING HELPERS
// ============================================================================

// Module-level cache for simple in-memory caching within a Lambda instance
const memoryCache = new Map<string, { value: unknown; expires: number }>()

/**
 * Simple in-memory cache with TTL
 * Note: Cache is per Lambda instance and cleared on cold starts
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const cached = memoryCache.get(key)

  if (cached && cached.expires > now) {
    return cached.value as T
  }

  const value = await fn()
  memoryCache.set(key, {
    value,
    expires: now + ttlSeconds * 1000,
  })

  return value
}

/**
 * Clear a specific cache entry
 */
export function clearCache(key: string): void {
  memoryCache.delete(key)
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  memoryCache.clear()
}

