# WhopShip Deployment Guide

WhopShip is Whop's hosting platform for apps, built on AWS Lambda with OpenNext. This guide covers deployment, common issues, and best practices.

## Quick Start

```bash
# Install the WhopShip CLI
bun add -g @whoplabs/whopctl

# Login to WhopShip
whopctl login

# Deploy your app
whopctl deploy
```

## Architecture Overview

WhopShip uses:

- **AWS Lambda** for serverless execution
- **OpenNext** to build Next.js for Lambda
- **S3** for static assets
- **DynamoDB** for routing

### Key Limitations

| Limit | Value | Impact |
|-------|-------|--------|
| Lambda payload | 6MB | Request/response body limit |
| Lambda memory | 1024MB default | Configurable |
| Cold start | ~1-3s | First request after idle |
| Concurrent executions | Varies | Can cause 429/503 errors |

## Common Issues & Solutions

### 1. "Request Entity Too Large" (413)

**Cause:** Request or response body exceeds Lambda's 6MB payload limit.

**Solutions:**

#### For File Uploads

Use presigned URLs to upload directly to storage:

```typescript
// 1. Get presigned URL from your API
const { uploadUrl, publicUrl } = await fetch('/api/files/upload-url', {
  method: 'POST',
  body: JSON.stringify({ folder: 'uploads', filename: file.name, fileSize: file.size }),
}).then(r => r.json())

// 2. Upload directly to storage (bypasses Lambda)
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
})

// 3. Use publicUrl in your app
```

#### For Large API Responses

- Paginate data (limit results per request)
- Never store base64 images in database - use URLs
- Use `select()` to fetch only needed columns

```typescript
// Bad - fetches ALL columns including large ones
const products = await db.select().from(products)

// Good - fetch only what you need
const products = await db.select({
  id: products.id,
  title: products.title,
  thumbnail: products.images,  // Just first image
}).from(products)
```

### 2. Rate Limiting (429/503)

**Cause:** Lambda concurrent execution limit exceeded.

**Solutions:**

1. **Request quota increase** from AWS console
2. **Optimize API calls:**
   ```typescript
   // Use React Query with appropriate staleTime
   const { data } = useQuery({
     queryKey: ['products'],
     queryFn: fetchProducts,
     staleTime: 60 * 1000, // Don't refetch for 1 minute
   })
   ```
3. **Batch requests** where possible

### 3. Cold Starts

**Cause:** Lambda instances are created on-demand after idle periods.

**Mitigation:**

- Keep bundles small
- Use streaming responses
- Pre-warm with scheduled pings (if critical)

```typescript
// open-next.config.ts
export default {
  default: {
    override: {
      wrapper: 'aws-lambda-streaming',
    },
  },
}
```

### 4. 404 for Static Assets

**Cause:** Asset hashes change between deployments; old HTML references stale chunks.

**Solutions:**

- Hard refresh (`Cmd+Shift+R`)
- Clear browser cache
- Add cache headers to your layout:

```typescript
export const revalidate = 0 // Don't cache HTML
```

## File Upload Best Practices

### The 5MB Rule

Files smaller than 5MB can go through your API. Files larger than 5MB **must** use presigned URLs.

```typescript
const THRESHOLD = 5 * 1024 * 1024 // 5MB

if (file.size > THRESHOLD) {
  // Use presigned URL upload
  await uploadViaPresignedUrl(file)
} else {
  // Direct upload is OK
  await uploadViaApi(file)
}
```

### Image Handling

**Never** store base64 data URLs in your database:

```typescript
// ❌ BAD - This will break your app
await db.insert(products).values({
  title: 'Product',
  images: ['data:image/png;base64,iVBORw0KGgo...'], // 500KB+ per image!
})

// ✅ GOOD - Store URLs only
await db.insert(products).values({
  title: 'Product',
  images: ['https://storage.example.com/product-123.png'],
})
```

## Environment Variables

Required environment variables for WhopShip:

```bash
# Whop Authentication
WHOP_API_KEY=your_api_key

# Supabase (if using storage addon)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Set these in the WhopShip dashboard or via CLI:

```bash
whopctl env set WHOP_API_KEY=xxx
```

## Logging & Debugging

WhopShip logs are available in AWS CloudWatch. Use structured logging for easier querying:

```typescript
import { createRequestLogger, generateRequestId } from '~/lib/api-utils'

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  const logger = createRequestLogger('POST /api/products', requestId)

  logger.info('Request started', { userId: 'xxx' })
  
  try {
    // ... your code
    logger.info('Request completed', { durationMs: 42 })
  } catch (error) {
    logger.error('Request failed', error)
  }
}
```

## Performance Tips

1. **Use React Query** with appropriate `staleTime` to reduce API calls
2. **Paginate everything** - never fetch unbounded lists
3. **Lazy load** heavy components
4. **Minimize bundle size** - check with `bun run analyze`
5. **Use edge caching** where appropriate

## Deployment Checklist

Before deploying:

- [ ] No base64 images stored in database
- [ ] File uploads use presigned URLs for files >5MB
- [ ] API responses are paginated
- [ ] Environment variables are set
- [ ] `open-next.config.ts` is configured
- [ ] `bun run build` succeeds locally

## Troubleshooting

### Build Failures

```bash
# Check logs
whopctl logs --follow

# Rebuild from scratch
rm -rf .next .open-next
whopctl deploy --force
```

### "Unsettled Promise" Crashes

This happens when fire-and-forget async operations are left running. Always await or explicitly ignore:

```typescript
// ❌ BAD - Promise left unsettled
fetch('/api/analytics', { method: 'POST', body: data })

// ✅ GOOD - Explicitly ignore
void fetch('/api/analytics', { method: 'POST', body: data })

// ✅ BEST - Await if possible
await fetch('/api/analytics', { method: 'POST', body: data })
```

## Resources

- [WhopShip Dashboard](https://whop.com/dashboard/apps)
- [OpenNext Documentation](https://open-next.js.org/)
- [AWS Lambda Limits](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)

