# Whop App API Best Practices

## Critical: Response Size Limits

### The Problem

Whop apps run in an iframe and communicate through Whop's proxy layer (`*.apps.whop.com`). This proxy **truncates responses at approximately 168KB**, causing JSON parsing errors in the client.

**Symptom**: `SyntaxError: Unterminated string in JSON at position XXXXX`

This is NOT a Lambda or WhopShip limit (they support 6MB buffered / 20MB streaming). The limitation is at the Whop iframe proxy layer.

### Solutions

#### 1. Use Aggressive Pagination (REQUIRED)

Always use small page sizes for list endpoints:

```typescript
// ❌ BAD: Default to 25-50 items
const limit = parseInt(params.get('limit') || '25', 10)

// ✅ GOOD: Default to 10 items or less
const limit = Math.min(parseInt(params.get('limit') || '10', 10), 50)
```

#### 2. Minimize Payload Size

Only return fields that clients actually need:

```typescript
// ❌ BAD: Return everything
const orders = await db.select().from(orders).where(...)

// ✅ GOOD: Select only needed fields
const orders = await db.select({
  id: orders.id,
  status: orders.status,
  productId: orders.productId,
  totalAmount: orders.totalAmount,
  createdAt: orders.createdAt,
}).from(orders).where(...)
```

#### 3. Implement Minimal Mode

Add a `minimal=true` parameter to skip optional data like thumbnails:

```typescript
const minimal = searchParams.get('minimal') === 'true'

const productsMap = new Map(products.map(p => ({
  id: p.id,
  title: p.title,
  thumbnail: minimal ? null : p.images?.[0], // Skip in minimal mode
})))
```

#### 4. Use Infinite Queries for Client-Side Pagination

In your React components, use `useInfiniteQuery` instead of `useQuery`:

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['orders', experienceId],
  queryFn: async ({ pageParam = 0 }) => {
    const res = await fetch(`/api/orders?offset=${pageParam}`)
    return res.json()
  },
  initialPageParam: 0,
  getNextPageParam: (lastPage) => 
    lastPage.pagination?.hasMore 
      ? lastPage.pagination.offset + lastPage.pagination.limit 
      : undefined,
})

// Combine all pages
const allOrders = data?.pages.flatMap(page => page.orders) ?? []
```

Then add a "Load More" button:

```tsx
{hasNextPage && (
  <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
    {isFetchingNextPage ? 'Loading...' : 'Load More'}
  </button>
)}
```

## Long-Term Solutions

### Option A: Server-Side Rendering (Recommended)

Use React Server Components to fetch data server-side. This bypasses the proxy entirely:

```tsx
// app/downloads/page.tsx (Server Component)
import { db } from '~/db'

export default async function DownloadsPage() {
  // Fetch server-side - no proxy limits!
  const orders = await db.select().from(orders).where(...)
  
  return <ClientDownloadsList orders={orders} />
}
```

### Option B: Direct S3 Fetch

For very large datasets, generate a pre-signed S3 URL:

1. Server uploads JSON to S3
2. Returns pre-signed URL (valid 60s)
3. Client fetches directly from S3 (bypasses proxy)

## Admin/Analytics Pages

Admin dashboards that need ALL data should:

1. **Use pagination with higher limits** for initial view
2. **Show incomplete data warning** if truncated
3. **Consider server-side aggregation** for stats (don't calculate client-side)

Example:

```tsx
const { data } = useQuery({
  ...ordersQuery(experienceId, { limit: 100 }), // Admin needs more
})

const orders = data?.orders ?? []
const hasMoreOrders = data?.pagination?.hasMore

return (
  <>
    {hasMoreOrders && (
      <Alert>Showing first {orders.length} of {data.pagination.total} orders</Alert>
    )}
    <Stats orders={orders} />
  </>
)
```

## Summary

- **Always paginate**: Default to 10 items or less
- **Minimize payloads**: Only return fields you need
- **Use infinite queries**: For seamless pagination UX
- **Consider SSR**: For data-heavy pages
- **Test with realistic data**: Create 20+ test records to catch truncation issues early

## Testing Checklist

- [ ] API endpoints default to ≤10 items per page
- [ ] API returns only necessary fields
- [ ] Client uses infinite query for lists
- [ ] Tested with 20+ records (to catch truncation)
- [ ] Load More button works correctly

