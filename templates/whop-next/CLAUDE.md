---
description: Instructions on how to use the whop api.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---
# Whop API - Instructions for LLM Agents

## Critical: Use ONLY the Recommended API Package

**Package**: `@whop/api` with `WhopServerSdk`  
**Documentation**: https://docs.whop.com/apps/api/getting-started  
**Status**: ✅ Recommended - contains full functionality including features missing in newer SDK

**Important Note:** Official docs may reference `@whop/sdk`, but use `WhopServerSdk` from `@whop/api` instead. The API structure uses:
- `WhopServerSdk()` function (not `new WhopAPI()` class)
- Object parameters: `{ experienceId }` (not positional args)
- CamelCase properties: `companyId`, `experienceId`, `userId`
- Nested responses requiring optional chaining: `receipts?.receipts?.nodes`

### DO Use
- `@whop/api` package with `WhopServerSdk`
- Object-based parameters with camelCase (`companyId`, `experienceId`, `userId`)
- Optional chaining (`?.`) for nested API responses
- Official documentation at https://docs.whop.com/

### DO NOT Use
- ⚠️ `@whop/sdk` package (newer but missing some functionality)
- ❌ `WhopAPI` class (use `WhopServerSdk` instead)
- ❌ GraphQL SDK (deprecated)
- ❌ API v2 (deprecated)
- ❌ API v5 (deprecated)
- ❌ Internal GraphQL API (not public, unsupported)
- ❌ Positional arguments (use object parameters)

## Common Patterns: Getting IDs from Context

### Getting Experience ID from the URL Path

In Whop apps, the experience ID is typically available in the URL path:

```typescript
// Next.js App Router - from params
export default function ExperiencePage({ params }: { params: { experienceId: string } }) {
  const experienceId = params.experienceId; // e.g., "exp_xxxxxxxxxxxxxx"
  // ...
}

// Next.js Pages Router - from router
import { useRouter } from 'next/router';

function ExperiencePage() {
  const router = useRouter();
  const experienceId = router.query.experienceId as string;
  // ...
}
```

### Getting Company ID from Experience ID

Once you have the experience ID, you can fetch the experience to get the company ID:

```typescript
import { WhopServerSdk } from '@whop/api';

const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});

// Retrieve the experience
const experience = await whop.experiences.getExperience({ experienceId });

// Get the company ID from the experience
const companyId = experience.company.id; // e.g., "biz_xxxxxxxxxxxxxx"

// Now you can use the company ID for other operations
const members = await whop.companies.listMembers({
  companyId: companyId,
  filters: {}
});
```

**Experience Object Structure:**
```typescript
{
  id: "exp_xxxxxxxxxxxxxx",
  name: "My App Instance",
  order: "123.45",
  created_at: "2023-12-01T05:00:00.401Z",
  app: {
    id: "app_xxxxxxxxxxxxxx",
    name: "My App"
  },
  company: {
    id: "biz_xxxxxxxxxxxxxx",  // <- This is the company ID
    title: "My Community",
    route: "my-community"
  },
  products: [
    {
      id: "prod_xxxxxxxxxxxxx",
      route: "premium-access",
      title: "Premium Access"
    }
  ]
}
```

## What the REST API Can Do

### ✅ Supported Operations

#### App Development
- Create, update, retrieve, and list apps
- Create and manage app builds for iOS, Android, Web
- Promote builds to production
- Configure app URLs (production, dev, preview)
- Set app permissions and OAuth scopes

#### Products & Monetization
- Create, update, delete, and list products (access passes)
- Create, update, delete, and list plans (checkout links)
- Get checkout URLs via `direct_link` field on plans
- Configure pricing (one-time, recurring, expiring)
- Set up payment methods (card, PayPal, ACH, etc.)
- Configure trials and discounts

#### Payment Processing
- List and retrieve payments
- Refund, retry, and void payments
- Create and manage invoices
- Process transfers to creators
- Access ledger account balances
- Configure checkout settings

#### Company & Member Management
- Retrieve company information
- List and retrieve members
- List and manage memberships (cancel, pause, resume)
- Manage authorized users (admins)
- Approve/deny waitlist entries
- Create and track shipments

#### Content & Communication
- Retrieve user information and check access
- Create, update, and manage experiences (app instances)
- Attach/detach experiences to products
- Create and list forum posts
- Update forum settings
- Send direct messages (DMs)
- Create and manage chat channels
- Create and manage support channels
- Add reactions to messages
- Track course lesson interactions

#### Special Features
- **Agent User**: Automate DMs using `NEXT_PUBLIC_WHOP_AGENT_USER_ID`
- **Webhooks**: Invoice events (created, paid, past due, voided)
- **Pagination**: Automatic via async iterators
- **Access Control**: Check if users have access to products

### ❌ What the REST API Cannot Do

The REST API does **NOT** support:
- Advanced GraphQL-style queries with custom field selection
- Nested mutations in a single request
- Direct database schema access
- Creating companies (companies must exist first)
- Complex filtering beyond what's exposed in query parameters
- Batch operations (must make individual calls)
- Real-time subscriptions (use webhooks instead)
- Custom SQL-like queries

## Finding Documentation

### Primary Sources (Always Check First)

1. **Official REST API Docs**: https://docs.whop.com/apps/api/getting-started
   - Complete API reference with examples
   - All endpoints documented
   - Request/response schemas
   
2. **SDK Documentation**: https://docs.whop.com/api-reference/
   - Individual endpoint pages
   - Code examples in JavaScript
   - Query parameters and response formats

3. **App Development Guide**: https://docs.whop.com/apps
   - High-level concepts
   - OAuth and authentication flows
   - Webhooks and event handling

### When Documentation is Insufficient

If the official docs don't have the information you need:

#### Use Exa MCP for Additional Context

```typescript
// Example: Search for Whop SDK usage patterns
mcp_exa_get_code_context_exa({
  query: "Whop API @whop/api create product with plans example"
})

// Example: Find implementation details
mcp_exa_get_code_context_exa({
  query: "Whop API agent user send automated messages NEXT_PUBLIC_WHOP_AGENT_USER_ID"
})

// Example: Find error handling patterns
mcp_exa_get_code_context_exa({
  query: "Whop API @whop/api error handling payment refund retry"
})
```

#### When to Use Exa MCP
- Official docs don't cover your specific use case
- Need real-world code examples
- Looking for error handling patterns
- Want to see how others have implemented features
- Need to understand undocumented behavior
- Troubleshooting specific errors

#### What to Search For
- Package name: `@whop/api` and `WhopServerSdk`
- Specific methods: `whop.experiences.getExperience`, `whop.payments.createCheckoutSession`
- Error messages you're encountering
- Feature combinations: "Whop API WhopServerSdk checkout receipts"
- Integration patterns: "Whop API verifyUserToken authentication"

## SDK Structure

### Client Initialization
```typescript
import { WhopServerSdk } from '@whop/api';

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});
```

### Resource Methods Pattern
All resources follow object-based parameter patterns:

```typescript
// Get single resource
const experience = await whop.experiences.getExperience({ experienceId });

// Get user
const user = await whop.users.getUser({ userId });

// Check access
const access = await whop.access.checkIfUserHasAccessToExperience({ 
  experienceId, 
  userId 
});

// List resources with filters
const members = await whop.companies.listMembers({
  companyId,
  filters: {
    accessPassIds: ['prod_xxx'],
  },
});

// Create checkout session
const checkout = await whop.payments.createCheckoutSession({ planId });

// List receipts
const receipts = await whop.payments.listReceiptsForCompany({
  companyId,
  filter: {
    accessPassIds: ['prod_xxx'],
    statuses: ['succeeded'],
  },
});

// Verify user token (imported separately)
import { verifyUserToken } from '@whop/api';
const { userId } = await verifyUserToken(req.headers);
```

### Available Resources
```typescript
// Import separately for authentication
import { verifyUserToken } from '@whop/api';

// Use whop instance for API calls
whop.experiences    // getExperience({ experienceId })
whop.users          // getUser({ userId })
whop.access         // checkIfUserHasAccessToExperience({ experienceId, userId })
whop.payments       // createCheckoutSession({ planId }), listReceiptsForCompany({ companyId, filter })
whop.companies      // listMembers({ companyId, filters })
```

**Common Methods:**
- `verifyUserToken(req.headers)` - **Import separately** - Verify and extract userId from request
- `whop.experiences.getExperience({ experienceId })` - Get experience details
- `whop.users.getUser({ userId })` - Get user information
- `whop.access.checkIfUserHasAccessToExperience({ experienceId, userId })` - Check user access
- `whop.payments.createCheckoutSession({ planId })` - Create checkout session
- `whop.payments.listReceiptsForCompany({ companyId, filter })` - List receipts
- `whop.companies.listMembers({ companyId, filters })` - List company members

## Common API Methods: Real-World Examples

### `verifyUserToken(headers)`

Verify user authentication from request headers.

**Example:**
```typescript
import { verifyUserToken } from '@whop/api';
import { NextRequest, NextResponse } from 'next/server';
import { whop } from '~/lib/whop';

export async function GET(req: NextRequest) {
  const { userId } = await verifyUserToken(req.headers);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use userId for further operations
  const user = await whop.users.getUser({ userId });
  return NextResponse.json(user);
}
```

---

### `whop.experiences.getExperience({ experienceId })`

Retrieve a specific experience by ID.

**Parameters:**
- `experienceId` (string) - The experience ID (e.g., `"exp_xxxxxxxxxxxxxx"`)

**Example:**
```typescript
const experience = await whop.experiences.getExperience({ 
  experienceId: "exp_xxxxxxxxxxxxxx" 
});

console.log(experience.name); // App instance name
console.log(experience.company.id); // Company ID
console.log(experience.company.title); // Company name
```

---

### `whop.users.getUser({ userId })`

Get user information.

**Example:**
```typescript
const user = await whop.users.getUser({ userId });
console.log(user.name, user.username, user.email);
```

---

### `whop.access.checkIfUserHasAccessToExperience({ experienceId, userId })`

Check if user has access to an experience.

**Example:**
```typescript
const access = await whop.access.checkIfUserHasAccessToExperience({ 
  experienceId, 
  userId 
});
console.log(access.accessLevel); // "admin" | "member" | "no_access"
```

---

### `whop.payments.createCheckoutSession({ planId })`

Create a checkout session for a plan.

**Example:**
```typescript
const checkoutSession = await whop.payments.createCheckoutSession({
  planId: "plan_xxxxxxxxxxxxxx"
});

// Use with iframe SDK
iframeSdk.inAppPurchase({ 
  planId: planId, 
  id: checkoutSession.id 
});

// Or redirect to checkout URL
window.open(`https://whop.com/checkout/${checkoutSession.id}`, "_blank");
```

---

### `whop.payments.listReceiptsForCompany({ companyId, filter })`

List receipts for a company with filters.

**Example:**
```typescript
const receipts = await whop.payments.listReceiptsForCompany({
  companyId: "biz_xxxxxxxxxxxxxx",
  filter: {
    accessPassIds: ["prod_xxx", "prod_yyy"],
    statuses: ['succeeded'],
  },
});

const nodes = receipts?.receipts?.nodes ?? [];
// Filter for specific user
const userReceipts = nodes.filter((r) => r?.member?.user?.id === userId);
```

---

### `whop.companies.listMembers({ companyId, filters })`

List members of a company with filters.

**Example:**
```typescript
const members = await whop.companies.listMembers({
  companyId: "biz_xxxxxxxxxxxxxx",
  filters: {
    accessPassIds: ["prod_xxx"],
  },
});

const nodes = members?.members?.nodes ?? [];
```

## Common Mistakes to Avoid

### ❌ Wrong: Not using object parameters
```typescript
// Wrong - positional arguments
await whop.experiences.getExperience("exp_xxx");

// Wrong - not checking for null
const name = receipts.receipts.nodes[0].member.user.name; // Can crash!
```

### ✅ Correct: Using object parameters
```typescript
await whop.companies.listMembers({
  companyId: "biz_123",   // Object-based params
  filters: {
    accessPassIds: ["prod_xxx"]
  }
});
```

### ❌ Wrong: Using limited SDK
```typescript
import Whop from '@whop/sdk';  // Missing some functionality!
const client = new Whop({ ... });
```

### ✅ Correct: Using WhopServerSdk
```typescript
import { WhopServerSdk } from '@whop/api';  // Recommended

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});
```

### ❌ Wrong: Not filtering user-specific data
```typescript
const receipts = await whop.payments.listReceiptsForCompany({ companyId });
// Returns ALL company receipts - privacy issue!
return receipts;
```

### ✅ Correct: Filter to authenticated user only
```typescript
import { verifyUserToken } from '@whop/api';

const { userId } = await verifyUserToken(req.headers);
const receipts = await whop.payments.listReceiptsForCompany({ companyId, filter });
const userReceipts = receipts?.receipts?.nodes?.filter(
  (r) => r?.member?.user?.id === userId
);
return userReceipts; // Only current user's data
```

## Error Handling

```typescript
import { verifyUserToken } from '@whop/api';
import { NextRequest, NextResponse } from 'next/server';
import { whop } from '~/lib/whop';

export async function POST(req: NextRequest) {
  const { userId } = await verifyUserToken(req.headers);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const checkoutSession = await whop.payments.createCheckoutSession({
      planId: "plan_xxxxxxxxxxxxxx"
    });

    if (!checkoutSession) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      planId: "plan_xxxxxxxxxxxxxx",
      checkoutId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    );
  }
}
```

## Quick Reference

### Authentication Flow
```typescript
import { verifyUserToken } from '@whop/api';
import { NextRequest, NextResponse } from 'next/server';
import { whop } from '~/lib/whop';

export async function GET(req: NextRequest) {
  // 1. Verify user token (imported separately)
  const { userId } = await verifyUserToken(req.headers);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch user data
  const user = await whop.users.getUser({ userId });
  
  return NextResponse.json({ user });
}
```

### Checkout Flow
```typescript
// 1. Create checkout session
const checkoutSession = await whop.payments.createCheckoutSession({
  planId: "plan_xxxxxxxxxxxxxx"
});

// 2. Open checkout in-app
iframeSdk.inAppPurchase({ 
  planId: "plan_xxx", 
  id: checkoutSession.id 
});

// Or open in new tab
window.open(`https://whop.com/checkout/${checkoutSession.id}`, "_blank");
```

### Receipts & Revenue Flow
```typescript
// 1. Fetch receipts
const receipts = await whop.payments.listReceiptsForCompany({
  companyId,
  filter: {
    accessPassIds: ["prod_one_time", "prod_subscription"],
    statuses: ['succeeded'],
  },
});

// 2. Filter to current user only (security!)
const userReceipts = receipts?.receipts?.nodes?.filter(
  (r) => r?.member?.user?.id === userId
);

// 3. Calculate revenue
const total = userReceipts.reduce((sum, r) => sum + (r.finalAmount ?? 0), 0);
```

### Member Management
```typescript
// List members with filters
const members = await whop.companies.listMembers({
  companyId: "biz_xxxxxxxxxxxxxx",
  filters: {
    accessPassIds: ["prod_subscription"],
  },
});

// Access member data
const nodes = members?.members?.nodes ?? [];
const memberId = nodes[0]?.id; // Use for management URL
const manageUrl = `https://whop.com/billing/manage/${memberId}`;
```

## Support & Resources

- **Official Docs**: https://docs.whop.com/
- **API Reference**: https://docs.whop.com/api-reference/
- **API Package**: https://www.npmjs.com/package/@whop/api
- **Getting Started**: https://docs.whop.com/apps/api/getting-started
- **Permissions Guide**: https://docs.whop.com/apps/api/permissions

## Security Best Practices

### 🔒 Critical: Always Filter User Data

**❌ NEVER return all company data:**
```typescript
// DANGEROUS - Returns ALL users' receipts!
const receipts = await whop.payments.listReceiptsForCompany({ companyId });
return NextResponse.json(receipts?.receipts?.nodes);
```

**✅ ALWAYS filter to current user:**
```typescript
import { verifyUserToken } from '@whop/api';

// SAFE - Only returns current user's receipts
const { userId } = await verifyUserToken(req.headers);
const receipts = await whop.payments.listReceiptsForCompany({ companyId, filter });
const userReceipts = receipts?.receipts?.nodes?.filter(
  (r) => r?.member?.user?.id === userId
);
return NextResponse.json(userReceipts);
```

### Key Security Rules
1. **Always call `whop.verifyUserToken(req.headers)` first** in protected routes
2. **Filter company-wide API responses** to only include current user's data
3. **Return minimal data** - only what the user needs to see
4. **Validate user authorization** before showing member IDs or other identifiers
5. **Use type guards** to safely access nested properties

## Summary for LLM Agents

1. **ALWAYS** use `WhopServerSdk` from `@whop/api` - not `WhopAPI` or `@whop/sdk`
2. **INITIALIZE** with `appId`, `appApiKey`, `onBehalfOfUserId`, and `companyId`
3. **USE** object-based parameters: `{ experienceId }` not positional args
4. **VERIFY** users with `verifyUserToken(req.headers)` (import from `@whop/api`) in ALL protected API routes
5. **FILTER** sensitive data to current user only - NEVER return all company data
6. **CHECK** for null/undefined when accessing nested properties from API responses
7. **HANDLE** errors with proper Next.js responses (401, 500, etc.)
8. **USE** `?.` optional chaining for safe property access
9. **TEST** thoroughly before deploying

When in doubt, consult the official documentation or use Exa MCP to find real-world examples and patterns.

# Whop API - Instructions for LLM Agents

## Critical: Use ONLY the Recommended API Package

**Package**: `@whop/api` with `WhopServerSdk`  
**Documentation**: https://docs.whop.com/apps/api/getting-started  
**Status**: ✅ Recommended - contains full functionality including features missing in newer SDK

**Important Note:** Official docs may reference `@whop/sdk`, but use `WhopServerSdk` from `@whop/api` instead. The API structure uses:
- `WhopServerSdk()` function (not `new WhopAPI()` class)
- Object parameters: `{ experienceId }` (not positional args)
- CamelCase properties: `companyId`, `experienceId`, `userId`
- Nested responses requiring optional chaining: `receipts?.receipts?.nodes`

### DO Use
- `@whop/api` package with `WhopServerSdk`
- Object-based parameters with camelCase (`companyId`, `experienceId`, `userId`)
- Optional chaining (`?.`) for nested API responses
- Official documentation at https://docs.whop.com/

### DO NOT Use
- ⚠️ `@whop/sdk` package (newer but missing some functionality)
- ❌ `WhopAPI` class (use `WhopServerSdk` instead)
- ❌ GraphQL SDK (deprecated)
- ❌ API v2 (deprecated)
- ❌ API v5 (deprecated)
- ❌ Internal GraphQL API (not public, unsupported)
- ❌ Positional arguments (use object parameters)

## What the REST API Can Do

### ✅ Supported Operations

#### App Development
- Create, update, retrieve, and list apps
- Create and manage app builds for iOS, Android, Web
- Promote builds to production
- Configure app URLs (production, dev, preview)
- Set app permissions and OAuth scopes

#### Products & Monetization
- Create, update, delete, and list products (access passes)
- Create, update, delete, and list plans (checkout links)
- Get checkout URLs via `direct_link` field on plans
- Configure pricing (one-time, recurring, expiring)
- Set up payment methods (card, PayPal, ACH, etc.)
- Configure trials and discounts

#### Payment Processing
- List and retrieve payments
- Refund, retry, and void payments
- Create and manage invoices
- Process transfers to creators
- Access ledger account balances
- Configure checkout settings

#### Company & Member Management
- Retrieve company information
- List and retrieve members
- List and manage memberships (cancel, pause, resume)
- Manage authorized users (admins)
- Approve/deny waitlist entries
- Create and track shipments

#### Content & Communication
- Retrieve user information and check access
- Create, update, and manage experiences (app instances)
- Attach/detach experiences to products
- Create and list forum posts
- Update forum settings
- Send direct messages (DMs)
- Create and manage chat channels
- Create and manage support channels
- Add reactions to messages
- Track course lesson interactions

#### Special Features
- **Agent User**: Automate DMs using `NEXT_PUBLIC_WHOP_AGENT_USER_ID`
- **Webhooks**: Invoice events (created, paid, past due, voided)
- **Pagination**: Automatic via async iterators
- **Access Control**: Check if users have access to products

### ❌ What the REST API Cannot Do

The REST API does **NOT** support:
- Advanced GraphQL-style queries with custom field selection
- Nested mutations in a single request
- Direct database schema access
- Creating companies (companies must exist first)
- Complex filtering beyond what's exposed in query parameters
- Batch operations (must make individual calls)
- Real-time subscriptions (use webhooks instead)
- Custom SQL-like queries

## Finding Documentation

### Primary Sources (Always Check First)

1. **Official REST API Docs**: https://docs.whop.com/apps/api/getting-started
   - Complete API reference with examples
   - All endpoints documented
   - Request/response schemas
   
2. **SDK Documentation**: https://docs.whop.com/api-reference/
   - Individual endpoint pages
   - Code examples in JavaScript
   - Query parameters and response formats

3. **App Development Guide**: https://docs.whop.com/apps
   - High-level concepts
   - OAuth and authentication flows
   - Webhooks and event handling

### When Documentation is Insufficient

If the official docs don't have the information you need:

#### Use Exa MCP for Additional Context

```typescript
// Example: Search for Whop SDK usage patterns
mcp_exa_get_code_context_exa({
  query: "Whop API @whop/api create product with plans example"
})

// Example: Find implementation details
mcp_exa_get_code_context_exa({
  query: "Whop API agent user send automated messages NEXT_PUBLIC_WHOP_AGENT_USER_ID"
})

// Example: Find error handling patterns
mcp_exa_get_code_context_exa({
  query: "Whop API @whop/api error handling payment refund retry"
})
```

#### When to Use Exa MCP
- Official docs don't cover your specific use case
- Need real-world code examples
- Looking for error handling patterns
- Want to see how others have implemented features
- Need to understand undocumented behavior
- Troubleshooting specific errors

#### What to Search For
- Package name: `@whop/api` and `WhopServerSdk`
- Specific methods: `whop.experiences.getExperience`, `whop.payments.createCheckoutSession`
- Error messages you're encountering
- Feature combinations: "Whop API WhopServerSdk checkout receipts"
- Integration patterns: "Whop API verifyUserToken authentication"

## SDK Structure

### Client Initialization
```typescript
import { WhopServerSdk } from '@whop/api';

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});
```

### Resource Methods Pattern
All resources follow object-based parameter patterns:

```typescript
// Get single resource
const experience = await whop.experiences.getExperience({ experienceId });

// Get user
const user = await whop.users.getUser({ userId });

// Check access
const access = await whop.access.checkIfUserHasAccessToExperience({ 
  experienceId, 
  userId 
});

// List resources with filters
const members = await whop.companies.listMembers({
  companyId,
  filters: {
    accessPassIds: ['prod_xxx'],
  },
});

// Create checkout session
const checkout = await whop.payments.createCheckoutSession({ planId });

// List receipts
const receipts = await whop.payments.listReceiptsForCompany({
  companyId,
  filter: {
    accessPassIds: ['prod_xxx'],
    statuses: ['succeeded'],
  },
});

// Verify user token (imported separately)
import { verifyUserToken } from '@whop/api';
const { userId } = await verifyUserToken(req.headers);
```

### Available Resources
```typescript
// Import separately for authentication
import { verifyUserToken } from '@whop/api';

// Use whop instance for API calls
whop.experiences    // getExperience({ experienceId })
whop.users          // getUser({ userId })
whop.access         // checkIfUserHasAccessToExperience({ experienceId, userId })
whop.payments       // createCheckoutSession({ planId }), listReceiptsForCompany({ companyId, filter })
whop.companies      // listMembers({ companyId, filters })
```

**Common Methods:**
- `verifyUserToken(req.headers)` - **Import separately** - Verify and extract userId from request
- `whop.experiences.getExperience({ experienceId })` - Get experience details
- `whop.users.getUser({ userId })` - Get user information
- `whop.access.checkIfUserHasAccessToExperience({ experienceId, userId })` - Check user access
- `whop.payments.createCheckoutSession({ planId })` - Create checkout session
- `whop.payments.listReceiptsForCompany({ companyId, filter })` - List receipts
- `whop.companies.listMembers({ companyId, filters })` - List company members

## Common API Methods: Real-World Examples

### `verifyUserToken(headers)`

Verify user authentication from request headers.

**Example:**
```typescript
import { verifyUserToken } from '@whop/api';
import { NextRequest, NextResponse } from 'next/server';
import { whop } from '~/lib/whop';

export async function GET(req: NextRequest) {
  const { userId } = await verifyUserToken(req.headers);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use userId for further operations
  const user = await whop.users.getUser({ userId });
  return NextResponse.json(user);
}
```

---

### `whop.experiences.getExperience({ experienceId })`

Retrieve a specific experience by ID.

**Parameters:**
- `experienceId` (string) - The experience ID (e.g., `"exp_xxxxxxxxxxxxxx"`)

**Example:**
```typescript
const experience = await whop.experiences.getExperience({ 
  experienceId: "exp_xxxxxxxxxxxxxx" 
});

console.log(experience.name); // App instance name
console.log(experience.company.id); // Company ID
console.log(experience.company.title); // Company name
```

---

### `whop.users.getUser({ userId })`

Get user information.

**Example:**
```typescript
const user = await whop.users.getUser({ userId });
console.log(user.name, user.username, user.email);
```

---

### `whop.access.checkIfUserHasAccessToExperience({ experienceId, userId })`

Check if user has access to an experience.

**Example:**
```typescript
const access = await whop.access.checkIfUserHasAccessToExperience({ 
  experienceId, 
  userId 
});
console.log(access.accessLevel); // "admin" | "member" | "no_access"
```

---

### `whop.payments.createCheckoutSession({ planId })`

Create a checkout session for a plan.

**Example:**
```typescript
const checkoutSession = await whop.payments.createCheckoutSession({
  planId: "plan_xxxxxxxxxxxxxx"
});

// Use with iframe SDK
iframeSdk.inAppPurchase({ 
  planId: planId, 
  id: checkoutSession.id 
});

// Or redirect to checkout URL
window.open(`https://whop.com/checkout/${checkoutSession.id}`, "_blank");
```

---

### `whop.payments.listReceiptsForCompany({ companyId, filter })`

List receipts for a company with filters.

**Example:**
```typescript
const receipts = await whop.payments.listReceiptsForCompany({
  companyId: "biz_xxxxxxxxxxxxxx",
  filter: {
    accessPassIds: ["prod_xxx", "prod_yyy"],
    statuses: ['succeeded'],
  },
});

const nodes = receipts?.receipts?.nodes ?? [];
// Filter for specific user
const userReceipts = nodes.filter((r) => r?.member?.user?.id === userId);
```

---

### `whop.companies.listMembers({ companyId, filters })`

List members of a company with filters.

**Example:**
```typescript
const members = await whop.companies.listMembers({
  companyId: "biz_xxxxxxxxxxxxxx",
  filters: {
    accessPassIds: ["prod_xxx"],
  },
});

const nodes = members?.members?.nodes ?? [];
```

## Common Mistakes to Avoid

### ❌ Wrong: Not using object parameters
```typescript
// Wrong - positional arguments
await whop.experiences.getExperience("exp_xxx");

// Wrong - not checking for null
const name = receipts.receipts.nodes[0].member.user.name; // Can crash!
```

### ✅ Correct: Using object parameters
```typescript
await whop.companies.listMembers({
  companyId: "biz_123",   // Object-based params
  filters: {
    accessPassIds: ["prod_xxx"]
  }
});
```

### ❌ Wrong: Using limited SDK
```typescript
import Whop from '@whop/sdk';  // Missing some functionality!
const client = new Whop({ ... });
```

### ✅ Correct: Using WhopServerSdk
```typescript
import { WhopServerSdk } from '@whop/api';  // Recommended

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});
```

### ❌ Wrong: Not filtering user-specific data
```typescript
const receipts = await whop.payments.listReceiptsForCompany({ companyId });
// Returns ALL company receipts - privacy issue!
return receipts;
```

### ✅ Correct: Filter to authenticated user only
```typescript
import { verifyUserToken } from '@whop/api';

const { userId } = await verifyUserToken(req.headers);
const receipts = await whop.payments.listReceiptsForCompany({ companyId, filter });
const userReceipts = receipts?.receipts?.nodes?.filter(
  (r) => r?.member?.user?.id === userId
);
return userReceipts; // Only current user's data
```

## Error Handling

```typescript
import { verifyUserToken } from '@whop/api';
import { NextRequest, NextResponse } from 'next/server';
import { whop } from '~/lib/whop';

export async function POST(req: NextRequest) {
  const { userId } = await verifyUserToken(req.headers);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const checkoutSession = await whop.payments.createCheckoutSession({
      planId: "plan_xxxxxxxxxxxxxx"
    });

    if (!checkoutSession) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      planId: "plan_xxxxxxxxxxxxxx",
      checkoutId: checkoutSession.id,
    });
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' }, 
      { status: 500 }
    );
  }
}
```

## Quick Reference

### Authentication Flow
```typescript
import { verifyUserToken } from '@whop/api';
import { NextRequest, NextResponse } from 'next/server';
import { whop } from '~/lib/whop';

export async function GET(req: NextRequest) {
  // 1. Verify user token (imported separately)
  const { userId } = await verifyUserToken(req.headers);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch user data
  const user = await whop.users.getUser({ userId });
  
  return NextResponse.json({ user });
}
```

### Checkout Flow
```typescript
// 1. Create checkout session
const checkoutSession = await whop.payments.createCheckoutSession({
  planId: "plan_xxxxxxxxxxxxxx"
});

// 2. Open checkout in-app
iframeSdk.inAppPurchase({ 
  planId: "plan_xxx", 
  id: checkoutSession.id 
});

// Or open in new tab
window.open(`https://whop.com/checkout/${checkoutSession.id}`, "_blank");
```

### Receipts & Revenue Flow
```typescript
// 1. Fetch receipts
const receipts = await whop.payments.listReceiptsForCompany({
  companyId,
  filter: {
    accessPassIds: ["prod_one_time", "prod_subscription"],
    statuses: ['succeeded'],
  },
});

// 2. Filter to current user only (security!)
const userReceipts = receipts?.receipts?.nodes?.filter(
  (r) => r?.member?.user?.id === userId
);

// 3. Calculate revenue
const total = userReceipts.reduce((sum, r) => sum + (r.finalAmount ?? 0), 0);
```

### Member Management
```typescript
// List members with filters
const members = await whop.companies.listMembers({
  companyId: "biz_xxxxxxxxxxxxxx",
  filters: {
    accessPassIds: ["prod_subscription"],
  },
});

// Access member data
const nodes = members?.members?.nodes ?? [];
const memberId = nodes[0]?.id; // Use for management URL
const manageUrl = `https://whop.com/billing/manage/${memberId}`;
```

## Support & Resources

- **Official Docs**: https://docs.whop.com/
- **API Reference**: https://docs.whop.com/api-reference/
- **API Package**: https://www.npmjs.com/package/@whop/api
- **Getting Started**: https://docs.whop.com/apps/api/getting-started
- **Permissions Guide**: https://docs.whop.com/apps/api/permissions

## Security Best Practices

### 🔒 Critical: Always Filter User Data

**❌ NEVER return all company data:**
```typescript
// DANGEROUS - Returns ALL users' receipts!
const receipts = await whop.payments.listReceiptsForCompany({ companyId });
return NextResponse.json(receipts?.receipts?.nodes);
```

**✅ ALWAYS filter to current user:**
```typescript
import { verifyUserToken } from '@whop/api';

// SAFE - Only returns current user's receipts
const { userId } = await verifyUserToken(req.headers);
const receipts = await whop.payments.listReceiptsForCompany({ companyId, filter });
const userReceipts = receipts?.receipts?.nodes?.filter(
  (r) => r?.member?.user?.id === userId
);
return NextResponse.json(userReceipts);
```

### Key Security Rules
1. **Always call `whop.verifyUserToken(req.headers)` first** in protected routes
2. **Filter company-wide API responses** to only include current user's data
3. **Return minimal data** - only what the user needs to see
4. **Validate user authorization** before showing member IDs or other identifiers
5. **Use type guards** to safely access nested properties

## Summary for LLM Agents

1. **ALWAYS** use `WhopServerSdk` from `@whop/api` - not `WhopAPI` or `@whop/sdk`
2. **INITIALIZE** with `appId`, `appApiKey`, `onBehalfOfUserId`, and `companyId`
3. **USE** object-based parameters: `{ experienceId }` not positional args
4. **VERIFY** users with `verifyUserToken(req.headers)` (import from `@whop/api`) in ALL protected API routes
5. **FILTER** sensitive data to current user only - NEVER return all company data
6. **CHECK** for null/undefined when accessing nested properties from API responses
7. **HANDLE** errors with proper Next.js responses (401, 500, etc.)
8. **USE** `?.` optional chaining for safe property access
9. **TEST** thoroughly before deploying

When in doubt, consult the official documentation or use Exa MCP to find real-world examples and patterns.

---
description: How to list members of a Whop company/community.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# Listing Members in Whop Communities

## Important: Filter Out App Agents by Default

**When a developer requests to list members of their Whop community, you MUST filter out app agents by default, unless they explicitly ask to include them.**

## What Are App Agents?

Each Whop app has an **agent user** automatically attached to it. When an app is installed on a company:
- An agent member is automatically created
- The agent appears in the company's member list
- The agent has admin-level access to the company
- The agent is used for automated actions (DMs, notifications, etc.)

## Problem

When you call `whop.companies.listMembers()`, the API returns **all members including app agents**. This means:
- A company with 100 apps installed will have 100+ agent members
- The list becomes cluttered with non-human members
- Developers typically only want to see real users

## Identifying App Agents

App agents have these identifying features:

### 1. **Email is null or empty** (Most Reliable)
```typescript
member.user.email === null
member.user.email === ""
member.user.email?.trim() === ""
```

### 2. Username Pattern
```
app-[timestamp]s-agent
// Examples:
// app-1761020340606s-agent
// app-1761163136087s-agent
```

### 3. Name Pattern
```
app-[timestamp]'s agent
// Examples:
// app-1761020340606's agent
// app-1761163136087's agent
```

### 4. Access Level
App agents typically have `accessLevel: "admin"`

### 5. Other Characteristics
- `totalSpent: 0` (they never make purchases)
- Generated profile pictures from UI Avatars
- Created at the same time as app installation

## How to Filter Out App Agents

### ✅ Recommended Method: Check Email

```typescript
// Filter out app agents (they have null or empty email addresses)
const realMembers = members.filter(
  (member) => member?.user?.email && member?.user?.email.trim() !== '',
)
```

This is the most reliable method because:
- App agents systematically have `null` or empty emails
- Real users always have valid email addresses
- It's a structural difference, not dependent on naming conventions

### Alternative Methods

```typescript
// Method 2: Username pattern matching
const realMembers = members.filter(
  (member) => !member?.user?.username?.match(/^app-\d+s?-agent$/),
)

// Method 3: Combination approach
const realMembers = members.filter((member) => {
  const hasEmail = member?.user?.email && member.user.email.trim() !== ''
  const isNotAgentPattern = !member?.user?.username?.match(/^app-\d+s?-agent$/)
  return hasEmail && isNotAgentPattern
})
```

## Complete Example

```typescript
import { verifyUserToken } from '@whop/api'
import { NextRequest, NextResponse } from 'next/server'
import { whop } from '~/lib/whop'

export async function GET(req: NextRequest) {
  const { userId } = await verifyUserToken(req.headers)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const companyId = process.env.NEXT_PUBLIC_WHOP_COMPANY_ID
  const membersResponse = await whop.companies.listMembers({
    companyId,
    filters: {},
  })

  const members = membersResponse?.members?.nodes ?? []

  // Filter out app agents (they have null or empty email addresses)
  const realMembers = members.filter(
    (member) => member?.user?.email && member?.user?.email.trim() !== '',
  )

  const transformedMembers = realMembers.map((member) => ({
    id: member?.id ?? '',
    user: {
      id: member?.user?.id ?? '',
      username: member?.user?.username ?? '',
      name: member?.user?.name ?? '',
      email: member?.user?.email ?? '',
      profilePicUrl: member?.imageSrcset?.original ?? null,
    },
    status: member?.status ?? 'unknown',
    createdAt: member?.createdAt ?? 0,
    joinedAt: member?.joinedAt ?? 0,
  }))

  return NextResponse.json({
    members: transformedMembers,
    totalCount: transformedMembers.length,
  })
}
```

## When to Include App Agents

Only include app agents if the developer **explicitly requests** them:
- "list all members including agents"
- "show me app agents"
- "include app agent users"

Otherwise, **always filter them out by default**.

## Member Data Structure

Real members have this structure:
```typescript
{
  "__typename": "CompanyMember",
  "accessLevel": "customer" | "admin",
  "createdAt": 1761163666,
  "id": "mber_xxxxx",
  "imageSrcset": {
    "__typename": "ImgSrcset",
    "original": "https://img-v2-prod.whop.com/..."
  },
  "joinedAt": 1761163666,
  "mrr": "$0.00",
  "phone": null | string,
  "status": "joined" | "active" | ...,
  "totalSpent": 0,
  "updatedAtMs": "1761163670271",
  "usdTotalSpent": "$0.00",
  "user": {
    "__typename": "CompanyMemberUser",
    "email": "user@example.com",  // ✓ Real users have emails
    "id": "user_xxxxx",
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

App agents have the same structure but:
```typescript
"user": {
  "email": null,  // ✗ Agents have null emails
  "name": "app-1761163344457's agent",
  "username": "app-1761163344457s-agent"
}
```

## Summary for LLM Agents

1. **ALWAYS filter out app agents by default** when listing members
2. **Use email check** as the primary filtering method
3. **Only include agents** if explicitly requested
4. **Document** the filtering in comments for clarity
5. **Return accurate counts** that reflect only real members

---
description: What is whop and how it works.
alwaysApply: true
---

# Whop Platform Structure & API Guide

## Overview

Whop is a platform for creators to build and monetize digital communities. It provides infrastructure for paywalled communities, content delivery, messaging, and app integrations.

## Core Platform Concepts

### Companies (Communities)

- **Companies** are the backend term for what users see as "communities"
- Each company represents a creator's digital space
- Companies can have:
  - Multiple members
  - Paywalls and subscription tiers
  - Installed apps and features
  - Custom branding and settings

### Members & Access Levels

- **Members** are users who have joined a company
- Each member has an **access level** that determines their permissions
- Members can be:
  - **Admins** - Full administrative access to manage the company
  - **Regular Members** - Standard access based on their membership tier
- Access levels control what features, content, and apps members can use

### Access Passes (Products)

- **Access Passes** are products that creators sell
- Also called "products" or "whops" in the UI
- Represent what a customer is purchasing (e.g., "Premium Membership", "Course Access")
- Can include:
  - Access to specific apps/experiences
  - Content and features
  - Different permission levels
- Types of access passes:
  - `regular` - Standard store pages
  - `app` - App-based products
  - `api_only` - API-only access (what apps usually create)
  - `experience_upsell` - Upsell products

### Plans (Checkout Links)

- **Plans** are the pricing/payment options for access passes
- Called "checkout links" in the creator dashboard
- Define how customers pay for an access pass:
  - One-time payments (`one_time`)
  - Recurring subscriptions (`renewal`)
  - Expiring access (`expiration`)
- Each plan has:
  - A **directLink** - the checkout URL customers use to purchase
  - Pricing configuration (price, currency, billing period)
  - Payment method options (card, PayPal, ACH, etc.)
  - Trial periods and discounts
- Multiple plans can exist for a single access pass (e.g., monthly vs annual)

### Apps & Experiences

#### Apps
- **Apps** are created by developers under a company
- When submitted for review, apps can be published to the Whop App Store
- Other creators can discover and install apps from the store
- Apps provide additional functionality to communities (e.g., courses, polls, custom features)

#### Experiences
- When an app is **installed** on a company, it creates an **experience**
- **Experience** = a specific instance of an app running on a company
- An app can be installed multiple times on the same company (multiple experiences)
- Each experience has a unique **experience ID**
- Experiences can be paywalled independently from the company

#### Relationship
```
App (template) 
  → Installed on Company A → Experience 1 (exp_abc123)
  → Installed on Company A → Experience 2 (exp_def456)
  → Installed on Company B → Experience 3 (exp_ghi789)
```

## Platform Features

### Paywalling Capabilities

Creators can paywall:
- **Entire company** - Require membership to access anything
- **Specific apps/experiences** - Require certain access passes to use specific features
- **Individual features** - Gate specific functionality within apps
- **Content tiers** - Different access levels see different content

### Built-in Apps (Special-Cased Features)

#### Forums
- Special-cased app for community discussions
- Creators can create forum posts/announcements
- Members can create topics and reply
- Has extensive API for managing posts, topics, and permissions
- Each forum experience has a `Feed::ForumFeed` containing `Feed::ForumPost` entries

#### Courses
- Special-cased app for educational content
- Extensive API for managing:
  - Lessons and modules
  - Assessment questions
  - Student progress
  - Completion tracking

#### Direct Messages (DMs)
- Built-in messaging feature for 1-on-1 conversations
- **Agent User**: Apps get `NEXT_PUBLIC_WHOP_AGENT_USER_ID` env variable
  - This is a fake user ID that apps can use to automate DM interactions
  - Useful for chatbots, notifications, and automated responses
- Features:
  - Message channels
  - Reactions to messages
  - Message history

#### Support Channels
- Special-cased feature for customer support
- Each company can have a dedicated support channel
- Members can create support tickets/conversations
- Admins can respond and manage support requests

### Additional Features

- **Shipments** - Physical product fulfillment tracking
- **Invoices** - Billing and payment records
- **Ledger Accounts** - Financial tracking for companies and users
- **Authorized Users** - Admin/team member management
- **Memberships** - Active subscriptions/access for members
- **Chat Channels** - Group messaging within communities
- **Reactions** - Emoji reactions in messages and content

## Whop SDKs & APIs

### Current API: REST API (Recommended)

**Package**: `@whop/api`  
**Documentation**: https://docs.whop.com/apps/api/getting-started

This is the **recommended API package** for building Whop apps with full functionality.

#### Capabilities:
- **App Configuration** - Set up URLs, permissions, settings
- **Authentication** - User auth, OAuth flows, session management
- **Products (Access Passes)** - Create, read, update, delete access passes
- **Plans** - Manage pricing, checkout links, payment options
- **Payments** - Handle checkouts, process transfers, track transactions
- **Companies** - Manage company settings, metadata, configuration
- **Members** - List members, manage access levels, permissions
- **Memberships** - Track active subscriptions, access periods
- **Experiences** - Manage app instances, configurations
- **Forums** - Create posts, manage topics, moderate discussions
- **Forum Messages** - Read, create, delete forum content
- **Direct Messages** - Send/receive DMs, manage conversations
- **Chat Channels** - Create and manage group chats
- **Support Channels** - Handle support tickets and conversations
- **Reactions** - Add/remove reactions to messages
- **Courses** - Full course management (lessons, assessments, progress)
- **Shipments** - Track physical product deliveries
- **Invoices** - Billing records and payment history
- **Ledger Accounts** - Financial accounts for companies and users
- **Authorized Users** - Manage admins and team members
- **Users** - User profiles, data, and settings

### Alternative SDK (Limited Functionality)

**Package**: `@whop/sdk`  
**Status**: Newer but missing some functionality - use `@whop/api` instead

### Deprecated APIs (Legacy)

The following are truly deprecated:
- **GraphQL SDK** - Original GraphQL-based API
- **v2** - Second iteration
- **v5** - Third iteration

These are maintained for backward compatibility only.

### Internal Frontend API (Not Public)

The GraphQL API explored in this conversation is used by Whop's internal frontend but is **not publicly documented or supported** for third-party developers. It provides lower-level access to:
- Access pass creation with advanced options
- Plan configuration details
- Company management internals
- Direct database operations

**For app development, always use the public REST API (`@whop/api`).**

## Development Workflow

### Creating a Whop App

1. **Initialize the SDK** in your lib/whop.ts
   ```typescript
   import { WhopServerSdk } from '@whop/api';
   import { env } from '~/env';
   
   export const whop = WhopServerSdk({
     appId: env.NEXT_PUBLIC_WHOP_APP_ID,
     appApiKey: env.WHOP_API_KEY,
     onBehalfOfUserId: env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
     companyId: env.NEXT_PUBLIC_WHOP_COMPANY_ID,
   });
   ```

2. **Create API routes** to interact with Whop
   ```typescript
   // app/(whop-api)/api/experience/[experienceId]/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { whop } from '~/lib/whop';
   
   export async function GET(
     req: NextRequest,
     { params }: { params: Promise<{ experienceId: string }> }
   ) {
     const { experienceId } = await params;
     const experience = await whop.experiences.getExperience({ experienceId });
     return NextResponse.json(experience);
   }
   ```

3. **Authenticate users** in protected routes
   ```typescript
   import { verifyUserToken } from '@whop/api';
   
   const { userId } = await verifyUserToken(req.headers);
   if (!userId) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

4. **Handle user data safely**
   - Always verify authentication first
   - Filter company-wide data to current user only
   - Use optional chaining for nested properties
   - Return minimal data to avoid privacy leaks

### Paywalling Your App

1. **Create checkout endpoint** for your plans
   ```typescript
   // app/(whop-api)/api/checkout/subscription/route.ts
   import { verifyUserToken } from '@whop/api';
   
   export async function POST(req: NextRequest) {
     const { userId } = await verifyUserToken(req.headers);
     if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     const checkoutSession = await whop.payments.createCheckoutSession({
       planId: env.SUBSCRIPTION_PLAN_ID
     });

     return NextResponse.json({
       planId: env.SUBSCRIPTION_PLAN_ID,
       checkoutId: checkoutSession.id,
     });
   }
   ```

2. **Check user access** to experiences
   ```typescript
   const access = await whop.access.checkIfUserHasAccessToExperience({
     experienceId,
     userId
   });
   console.log(access.accessLevel); // "admin" | "member" | "no_access"
   ```

3. **List user's receipts** to check purchases
   ```typescript
   const receipts = await whop.payments.listReceiptsForCompany({
     companyId,
     filter: {
       accessPassIds: [planId],
       statuses: ['succeeded']
     }
   });
   
   const userReceipts = receipts?.receipts?.nodes?.filter(
     (r) => r?.member?.user?.id === userId
   );
   ```

4. **Gate features** based on subscription status
   ```typescript
   const hasActiveSubscription = userReceipts.some(
     (r) => r.subscriptionStatus === "active"
   );
   ```

### Using the Agent User

The `WhopServerSdk` is initialized with `onBehalfOfUserId` for automated actions:
- Set to `NEXT_PUBLIC_WHOP_AGENT_USER_ID` for bot actions
- Used for sending automated messages
- Enables chatbots and notification systems

**Note:** The agent user is configured during SDK initialization, not per-request.

## Key API Patterns

### GraphQL (Internal)
```graphql
mutation createAccessPass($input: CreateAccessPassInput!) {
  createAccessPass(input: $input) {
    id
    route
    defaultPlan {
      id
      directLink
    }
  }
}
```

### REST API (Public SDK)
```typescript
import { WhopServerSdk, verifyUserToken } from '@whop/api';

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});

// Verify user authentication (import verifyUserToken separately)
const { userId } = await verifyUserToken(req.headers);

// Get user info
const user = await whop.users.getUser({ userId });

// Check access
const access = await whop.access.checkIfUserHasAccessToExperience({ 
  experienceId, 
  userId 
});

// Create checkout session
const checkout = await whop.payments.createCheckoutSession({ 
  planId: "plan_xxx" 
});

// The checkout ID for iframe SDK
console.log(checkout.id); // Use with iframeSdk.inAppPurchase()
```

## Terminology Reference

| Backend Term | UI Term | Description |
|--------------|---------|-------------|
| Company | Community | A creator's digital space |
| Access Pass | Product/Whop | What customers purchase |
| Plan | Checkout Link | Pricing/payment option |
| Experience | App Instance | Installed app on a company |
| Authorized User | Admin | User with admin permissions |
| Membership | Subscription | User's active access to a company |

## Resources

- **Official Documentation**: https://docs.whop.com/
- **REST API Docs**: https://docs.whop.com/apps/api/getting-started
- **App Development**: https://docs.whop.com/apps
- **SDK Package**: `@whop/api` (npm)

## Common API Examples

### Authentication in API Routes
```typescript
import { verifyUserToken } from '@whop/api';

export async function GET(req: NextRequest) {
  const { userId } = await verifyUserToken(req.headers);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Proceed with authenticated request
}
```

### Get Experience Data
```typescript
const experience = await whop.experiences.getExperience({ 
  experienceId: "exp_xxx" 
});
console.log(experience.name, experience.company.title);
```

### Get User Data
```typescript
const user = await whop.users.getUser({ userId });
console.log(user.name, user.username, user.email);
```

### Check User Access
```typescript
const access = await whop.access.checkIfUserHasAccessToExperience({
  experienceId: "exp_xxx",
  userId: "user_xxx"
});
console.log(access.accessLevel); // "admin" | "member" | "no_access"
```

### Create Checkout Session
```typescript
const checkout = await whop.payments.createCheckoutSession({
  planId: "plan_xxx"
});

// Use with iframe SDK
iframeSdk.inAppPurchase({ planId, id: checkout.id });
```

### List Receipts (Filtered to User)
```typescript
const receipts = await whop.payments.listReceiptsForCompany({
  companyId,
  filter: {
    accessPassIds: ["prod_xxx"],
    statuses: ['succeeded']
  }
});

// IMPORTANT: Filter to current user only
const userReceipts = receipts?.receipts?.nodes?.filter(
  (r) => r?.member?.user?.id === userId
);
```

### List Members with Filters
```typescript
const members = await whop.companies.listMembers({
  companyId,
  filters: {
    accessPassIds: ["prod_xxx"]
  }
});

const nodes = members?.members?.nodes ?? [];
```

## Best Practices

1. **Always use `WhopServerSdk`** from `@whop/api` package
2. **Use object parameters with camelCase** - `{ companyId }`, `{ experienceId }`, `{ userId }`
3. **Handle webhooks** to stay in sync with installations and payments
4. **Implement proper error handling** for API calls
5. **Cache user permissions** to avoid excessive API calls
6. **Use the agent user** for automated messaging features
7. **Test paywalling** thoroughly before launch
8. **Follow OAuth best practices** for user authentication
9. **Monitor API rate limits** and implement backoff strategies
10. **Filter all company-wide API responses** to current user only - critical for privacy

## Notes for LLM Agents

### API Usage
- Use `WhopServerSdk` from `@whop/api` package
- Initialize with `appId`, `appApiKey`, `onBehalfOfUserId`, `companyId`
- **Use camelCase for parameters**: `companyId`, `experienceId`, `userId`
- **Use object-based params**: `{ experienceId }` not positional arguments
- Always use optional chaining (`?.`) for nested API responses

### Terminology
- Access passes and products are the same thing
- Plans and checkout links are the same thing
- Companies and communities are the same thing
- Experiences are instances of apps, not the apps themselves
- The `direct_link` field on plans is the checkout URL customers use

### Validation Rules
- Routes must be lowercase, alphanumeric with hyphens only: `a-z`, `0-9`, `-`
- Routes cannot start or end with hyphens
- Routes must be at least 2 characters, max 100 characters
- Routes must be unique across all access passes

### SDK Initialization
```typescript
import { WhopServerSdk } from '@whop/api';

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});
```

### API Response Pattern
API responses use nested structures - always check for null/undefined:
```typescript
// Safe property access
const receipts = await whop.payments.listReceiptsForCompany({ companyId, filter });
const nodes = receipts?.receipts?.nodes ?? [];

// Filter and transform safely
const userReceipts = nodes.filter((r) => r?.member?.user?.id === userId);
```

# Whop Platform Structure & API Guide

## Overview

Whop is a platform for creators to build and monetize digital communities. It provides infrastructure for paywalled communities, content delivery, messaging, and app integrations.

## Core Platform Concepts

### Companies (Communities)

- **Companies** are the backend term for what users see as "communities"
- Each company represents a creator's digital space
- Companies can have:
  - Multiple members
  - Paywalls and subscription tiers
  - Installed apps and features
  - Custom branding and settings

### Members & Access Levels

- **Members** are users who have joined a company
- Each member has an **access level** that determines their permissions
- Members can be:
  - **Admins** - Full administrative access to manage the company
  - **Regular Members** - Standard access based on their membership tier
- Access levels control what features, content, and apps members can use

### Access Passes (Products)

- **Access Passes** are products that creators sell
- Also called "products" or "whops" in the UI
- Represent what a customer is purchasing (e.g., "Premium Membership", "Course Access")
- Can include:
  - Access to specific apps/experiences
  - Content and features
  - Different permission levels
- Types of access passes:
  - `regular` - Standard store pages
  - `app` - App-based products
  - `api_only` - API-only access (what apps usually create)
  - `experience_upsell` - Upsell products

### Plans (Checkout Links)

- **Plans** are the pricing/payment options for access passes
- Called "checkout links" in the creator dashboard
- Define how customers pay for an access pass:
  - One-time payments (`one_time`)
  - Recurring subscriptions (`renewal`)
  - Expiring access (`expiration`)
- Each plan has:
  - A **directLink** - the checkout URL customers use to purchase
  - Pricing configuration (price, currency, billing period)
  - Payment method options (card, PayPal, ACH, etc.)
  - Trial periods and discounts
- Multiple plans can exist for a single access pass (e.g., monthly vs annual)

### Apps & Experiences

#### Apps
- **Apps** are created by developers under a company
- When submitted for review, apps can be published to the Whop App Store
- Other creators can discover and install apps from the store
- Apps provide additional functionality to communities (e.g., courses, polls, custom features)

#### Experiences
- When an app is **installed** on a company, it creates an **experience**
- **Experience** = a specific instance of an app running on a company
- An app can be installed multiple times on the same company (multiple experiences)
- Each experience has a unique **experience ID**
- Experiences can be paywalled independently from the company

#### Relationship
```
App (template) 
  → Installed on Company A → Experience 1 (exp_abc123)
  → Installed on Company A → Experience 2 (exp_def456)
  → Installed on Company B → Experience 3 (exp_ghi789)
```

## Platform Features

### Paywalling Capabilities

Creators can paywall:
- **Entire company** - Require membership to access anything
- **Specific apps/experiences** - Require certain access passes to use specific features
- **Individual features** - Gate specific functionality within apps
- **Content tiers** - Different access levels see different content

### Built-in Apps (Special-Cased Features)

#### Forums
- Special-cased app for community discussions
- Creators can create forum posts/announcements
- Members can create topics and reply
- Has extensive API for managing posts, topics, and permissions
- Each forum experience has a `Feed::ForumFeed` containing `Feed::ForumPost` entries

#### Courses
- Special-cased app for educational content
- Extensive API for managing:
  - Lessons and modules
  - Assessment questions
  - Student progress
  - Completion tracking

#### Direct Messages (DMs)
- Built-in messaging feature for 1-on-1 conversations
- **Agent User**: Apps get `NEXT_PUBLIC_WHOP_AGENT_USER_ID` env variable
  - This is a fake user ID that apps can use to automate DM interactions
  - Useful for chatbots, notifications, and automated responses
- Features:
  - Message channels
  - Reactions to messages
  - Message history

#### Support Channels
- Special-cased feature for customer support
- Each company can have a dedicated support channel
- Members can create support tickets/conversations
- Admins can respond and manage support requests

### Additional Features

- **Shipments** - Physical product fulfillment tracking
- **Invoices** - Billing and payment records
- **Ledger Accounts** - Financial tracking for companies and users
- **Authorized Users** - Admin/team member management
- **Memberships** - Active subscriptions/access for members
- **Chat Channels** - Group messaging within communities
- **Reactions** - Emoji reactions in messages and content

## Whop SDKs & APIs

### Current API: REST API (Recommended)

**Package**: `@whop/api`  
**Documentation**: https://docs.whop.com/apps/api/getting-started

This is the **recommended API package** for building Whop apps with full functionality.

#### Capabilities:
- **App Configuration** - Set up URLs, permissions, settings
- **Authentication** - User auth, OAuth flows, session management
- **Products (Access Passes)** - Create, read, update, delete access passes
- **Plans** - Manage pricing, checkout links, payment options
- **Payments** - Handle checkouts, process transfers, track transactions
- **Companies** - Manage company settings, metadata, configuration
- **Members** - List members, manage access levels, permissions
- **Memberships** - Track active subscriptions, access periods
- **Experiences** - Manage app instances, configurations
- **Forums** - Create posts, manage topics, moderate discussions
- **Forum Messages** - Read, create, delete forum content
- **Direct Messages** - Send/receive DMs, manage conversations
- **Chat Channels** - Create and manage group chats
- **Support Channels** - Handle support tickets and conversations
- **Reactions** - Add/remove reactions to messages
- **Courses** - Full course management (lessons, assessments, progress)
- **Shipments** - Track physical product deliveries
- **Invoices** - Billing records and payment history
- **Ledger Accounts** - Financial accounts for companies and users
- **Authorized Users** - Manage admins and team members
- **Users** - User profiles, data, and settings

### Alternative SDK (Limited Functionality)

**Package**: `@whop/sdk`  
**Status**: Newer but missing some functionality - use `@whop/api` instead

### Deprecated APIs (Legacy)

The following are truly deprecated:
- **GraphQL SDK** - Original GraphQL-based API
- **v2** - Second iteration
- **v5** - Third iteration

These are maintained for backward compatibility only.

### Internal Frontend API (Not Public)

The GraphQL API explored in this conversation is used by Whop's internal frontend but is **not publicly documented or supported** for third-party developers. It provides lower-level access to:
- Access pass creation with advanced options
- Plan configuration details
- Company management internals
- Direct database operations

**For app development, always use the public REST API (`@whop/api`).**

## Development Workflow

### Creating a Whop App

1. **Initialize the SDK** in your lib/whop.ts
   ```typescript
   import { WhopServerSdk } from '@whop/api';
   import { env } from '~/env';
   
   export const whop = WhopServerSdk({
     appId: env.NEXT_PUBLIC_WHOP_APP_ID,
     appApiKey: env.WHOP_API_KEY,
     onBehalfOfUserId: env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
     companyId: env.NEXT_PUBLIC_WHOP_COMPANY_ID,
   });
   ```

2. **Create API routes** to interact with Whop
   ```typescript
   // app/(whop-api)/api/experience/[experienceId]/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { whop } from '~/lib/whop';
   
   export async function GET(
     req: NextRequest,
     { params }: { params: Promise<{ experienceId: string }> }
   ) {
     const { experienceId } = await params;
     const experience = await whop.experiences.getExperience({ experienceId });
     return NextResponse.json(experience);
   }
   ```

3. **Authenticate users** in protected routes
   ```typescript
   import { verifyUserToken } from '@whop/api';
   
   const { userId } = await verifyUserToken(req.headers);
   if (!userId) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

4. **Handle user data safely**
   - Always verify authentication first
   - Filter company-wide data to current user only
   - Use optional chaining for nested properties
   - Return minimal data to avoid privacy leaks

### Paywalling Your App

1. **Create checkout endpoint** for your plans
   ```typescript
   // app/(whop-api)/api/checkout/subscription/route.ts
   import { verifyUserToken } from '@whop/api';
   
   export async function POST(req: NextRequest) {
     const { userId } = await verifyUserToken(req.headers);
     if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

     const checkoutSession = await whop.payments.createCheckoutSession({
       planId: env.SUBSCRIPTION_PLAN_ID
     });

     return NextResponse.json({
       planId: env.SUBSCRIPTION_PLAN_ID,
       checkoutId: checkoutSession.id,
     });
   }
   ```

2. **Check user access** to experiences
   ```typescript
   const access = await whop.access.checkIfUserHasAccessToExperience({
     experienceId,
     userId
   });
   console.log(access.accessLevel); // "admin" | "member" | "no_access"
   ```

3. **List user's receipts** to check purchases
   ```typescript
   const receipts = await whop.payments.listReceiptsForCompany({
     companyId,
     filter: {
       accessPassIds: [planId],
       statuses: ['succeeded']
     }
   });
   
   const userReceipts = receipts?.receipts?.nodes?.filter(
     (r) => r?.member?.user?.id === userId
   );
   ```

4. **Gate features** based on subscription status
   ```typescript
   const hasActiveSubscription = userReceipts.some(
     (r) => r.subscriptionStatus === "active"
   );
   ```

### Using the Agent User

The `WhopServerSdk` is initialized with `onBehalfOfUserId` for automated actions:
- Set to `NEXT_PUBLIC_WHOP_AGENT_USER_ID` for bot actions
- Used for sending automated messages
- Enables chatbots and notification systems

**Note:** The agent user is configured during SDK initialization, not per-request.

## Key API Patterns

### GraphQL (Internal)
```graphql
mutation createAccessPass($input: CreateAccessPassInput!) {
  createAccessPass(input: $input) {
    id
    route
    defaultPlan {
      id
      directLink
    }
  }
}
```

### REST API (Public SDK)
```typescript
import { WhopServerSdk, verifyUserToken } from '@whop/api';

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});

// Verify user authentication (import verifyUserToken separately)
const { userId } = await verifyUserToken(req.headers);

// Get user info
const user = await whop.users.getUser({ userId });

// Check access
const access = await whop.access.checkIfUserHasAccessToExperience({ 
  experienceId, 
  userId 
});

// Create checkout session
const checkout = await whop.payments.createCheckoutSession({ 
  planId: "plan_xxx" 
});

// The checkout ID for iframe SDK
console.log(checkout.id); // Use with iframeSdk.inAppPurchase()
```

## Terminology Reference

| Backend Term | UI Term | Description |
|--------------|---------|-------------|
| Company | Community | A creator's digital space |
| Access Pass | Product/Whop | What customers purchase |
| Plan | Checkout Link | Pricing/payment option |
| Experience | App Instance | Installed app on a company |
| Authorized User | Admin | User with admin permissions |
| Membership | Subscription | User's active access to a company |

## Resources

- **Official Documentation**: https://docs.whop.com/
- **REST API Docs**: https://docs.whop.com/apps/api/getting-started
- **App Development**: https://docs.whop.com/apps
- **SDK Package**: `@whop/api` (npm)

## Common API Examples

### Authentication in API Routes
```typescript
import { verifyUserToken } from '@whop/api';

export async function GET(req: NextRequest) {
  const { userId } = await verifyUserToken(req.headers);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Proceed with authenticated request
}
```

### Get Experience Data
```typescript
const experience = await whop.experiences.getExperience({ 
  experienceId: "exp_xxx" 
});
console.log(experience.name, experience.company.title);
```

### Get User Data
```typescript
const user = await whop.users.getUser({ userId });
console.log(user.name, user.username, user.email);
```

### Check User Access
```typescript
const access = await whop.access.checkIfUserHasAccessToExperience({
  experienceId: "exp_xxx",
  userId: "user_xxx"
});
console.log(access.accessLevel); // "admin" | "member" | "no_access"
```

### Create Checkout Session
```typescript
const checkout = await whop.payments.createCheckoutSession({
  planId: "plan_xxx"
});

// Use with iframe SDK
iframeSdk.inAppPurchase({ planId, id: checkout.id });
```

### List Receipts (Filtered to User)
```typescript
const receipts = await whop.payments.listReceiptsForCompany({
  companyId,
  filter: {
    accessPassIds: ["prod_xxx"],
    statuses: ['succeeded']
  }
});

// IMPORTANT: Filter to current user only
const userReceipts = receipts?.receipts?.nodes?.filter(
  (r) => r?.member?.user?.id === userId
);
```

### List Members with Filters
```typescript
const members = await whop.companies.listMembers({
  companyId,
  filters: {
    accessPassIds: ["prod_xxx"]
  }
});

const nodes = members?.members?.nodes ?? [];
```

## Best Practices

1. **Always use `WhopServerSdk`** from `@whop/api` package
2. **Use object parameters with camelCase** - `{ companyId }`, `{ experienceId }`, `{ userId }`
3. **Handle webhooks** to stay in sync with installations and payments
4. **Implement proper error handling** for API calls
5. **Cache user permissions** to avoid excessive API calls
6. **Use the agent user** for automated messaging features
7. **Test paywalling** thoroughly before launch
8. **Follow OAuth best practices** for user authentication
9. **Monitor API rate limits** and implement backoff strategies
10. **Filter all company-wide API responses** to current user only - critical for privacy

## Notes for LLM Agents

### API Usage
- Use `WhopServerSdk` from `@whop/api` package
- Initialize with `appId`, `appApiKey`, `onBehalfOfUserId`, `companyId`
- **Use camelCase for parameters**: `companyId`, `experienceId`, `userId`
- **Use object-based params**: `{ experienceId }` not positional arguments
- Always use optional chaining (`?.`) for nested API responses

### Terminology
- Access passes and products are the same thing
- Plans and checkout links are the same thing
- Companies and communities are the same thing
- Experiences are instances of apps, not the apps themselves
- The `direct_link` field on plans is the checkout URL customers use

### Validation Rules
- Routes must be lowercase, alphanumeric with hyphens only: `a-z`, `0-9`, `-`
- Routes cannot start or end with hyphens
- Routes must be at least 2 characters, max 100 characters
- Routes must be unique across all access passes

### SDK Initialization
```typescript
import { WhopServerSdk } from '@whop/api';

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});
```

### API Response Pattern
API responses use nested structures - always check for null/undefined:
```typescript
// Safe property access
const receipts = await whop.payments.listReceiptsForCompany({ companyId, filter });
const nodes = receipts?.receipts?.nodes ?? [];

// Filter and transform safely
const userReceipts = nodes.filter((r) => r?.member?.user?.id === userId);
```

---
description: The list of whop rest api endpoints and their usage.
alwaysApply: false
---
# Whop REST API - Complete Endpoint Reference

Source: https://docs.whop.com/api-reference/apps/list-apps

## Introduction

- **Getting Started**: https://docs.whop.com/apps/api/getting-started
- **Permissions**: https://docs.whop.com/apps/api/permissions

## Payments

### Products
- **GET** List products - https://docs.whop.com/api-reference/products/list-products
- **POST** Create product - https://docs.whop.com/api-reference/products/create-product
- **GET** Retrieve product - https://docs.whop.com/api-reference/products/retrieve-product
- **PATCH** Update product - https://docs.whop.com/api-reference/products/update-product
- **DELETE** Delete product - https://docs.whop.com/api-reference/products/delete-product

### Plans
- **GET** List plans - https://docs.whop.com/api-reference/plans/list-plans
- **POST** Create plan - https://docs.whop.com/api-reference/plans/create-plan
- **GET** Retrieve plan - https://docs.whop.com/api-reference/plans/retrieve-plan
- **PATCH** Update plan - https://docs.whop.com/api-reference/plans/update-plan
- **DELETE** Delete plan - https://docs.whop.com/api-reference/plans/delete-plan

### Payments
- **GET** List payments - https://docs.whop.com/api-reference/payments/list-payments
- **GET** Retrieve payment - https://docs.whop.com/api-reference/payments/retrieve-payment
- **POST** Refund payment - https://docs.whop.com/api-reference/payments/refund-payment
- **POST** Retry payment - https://docs.whop.com/api-reference/payments/retry-payment
- **POST** Void payment - https://docs.whop.com/api-reference/payments/void-payment

### Invoices
- **GET** List invoices - https://docs.whop.com/api-reference/invoices/list-invoices
- **POST** Create invoice - https://docs.whop.com/api-reference/invoices/create-invoice
- **GET** Retrieve invoice - https://docs.whop.com/api-reference/invoices/retrieve-invoice
- **POST** Void invoice - https://docs.whop.com/api-reference/invoices/void-invoice
- **WEBHOOK** Invoice created - https://docs.whop.com/api-reference/invoices/invoice-created
- **WEBHOOK** Invoice paid - https://docs.whop.com/api-reference/invoices/invoice-paid
- **WEBHOOK** Invoice past due - https://docs.whop.com/api-reference/invoices/invoice-past-due
- **WEBHOOK** Invoice voided - https://docs.whop.com/api-reference/invoices/invoice-voided

### Transfers
- **GET** List transfers - https://docs.whop.com/api-reference/transfers/list-transfers
- **POST** Create transfer - https://docs.whop.com/api-reference/transfers/create-transfer
- **GET** Retrieve transfer - https://docs.whop.com/api-reference/transfers/retrieve-transfer

### Ledger Accounts
- **GET** Retrieve ledger account - https://docs.whop.com/api-reference/ledger-accounts/retrieve-ledger-account

### Checkout Configurations
- **GET** List checkout configurations - https://docs.whop.com/api-reference/checkout-configurations/list-checkout-configurations
- **POST** Create checkout configuration - https://docs.whop.com/api-reference/checkout-configurations/create-checkout-configuration
- **GET** Retrieve checkout configuration - https://docs.whop.com/api-reference/checkout-configurations/retrieve-checkout-configuration

## Admin

### Companies
- **GET** Retrieve company - https://docs.whop.com/api-reference/companies/retrieve-company

### Members
- **GET** List members - https://docs.whop.com/api-reference/members/list-members
- **GET** Retrieve member - https://docs.whop.com/api-reference/members/retrieve-member

### Memberships
- **GET** List memberships - https://docs.whop.com/api-reference/memberships/list-memberships
- **GET** Retrieve membership - https://docs.whop.com/api-reference/memberships/retrieve-membership
- **PATCH** Update membership - https://docs.whop.com/api-reference/memberships/update-membership
- **POST** Cancel membership - https://docs.whop.com/api-reference/memberships/cancel-membership
- **POST** Pause membership - https://docs.whop.com/api-reference/memberships/pause-membership
- **POST** Resume membership - https://docs.whop.com/api-reference/memberships/resume-membership

### Entries
- **GET** List entries - https://docs.whop.com/api-reference/entries/list-entries
- **GET** Retrieve entry - https://docs.whop.com/api-reference/entries/retrieve-entry
- **POST** Approve entry - https://docs.whop.com/api-reference/entries/approve-entry
- **POST** Deny entry - https://docs.whop.com/api-reference/entries/deny-entry

### Shipments
- **GET** List shipments - https://docs.whop.com/api-reference/shipments/list-shipments
- **POST** Create shipment - https://docs.whop.com/api-reference/shipments/create-shipment
- **GET** Retrieve shipment - https://docs.whop.com/api-reference/shipments/retrieve-shipment

### Authorized Users
- **GET** List authorized users - https://docs.whop.com/api-reference/authorized-users/list-authorized-users
- **GET** Retrieve authorized user - https://docs.whop.com/api-reference/authorized-users/retrieve-authorized-user

## Content

### Users
- **GET** Retrieve user - https://docs.whop.com/api-reference/users/retrieve-user
- **GET** Check access - https://docs.whop.com/api-reference/users/check-access

### Experiences
- **GET** List experiences - https://docs.whop.com/api-reference/experiences/list-experiences
- **POST** Create experience - https://docs.whop.com/api-reference/experiences/create-experience
- **GET** Retrieve experience - https://docs.whop.com/api-reference/experiences/retrieve-experience
- **PATCH** Update experience - https://docs.whop.com/api-reference/experiences/update-experience
- **DELETE** Delete experience - https://docs.whop.com/api-reference/experiences/delete-experience
- **POST** Attach experience - https://docs.whop.com/api-reference/experiences/attach-experience
- **POST** Detach experience - https://docs.whop.com/api-reference/experiences/detach-experience

### Forum Posts
- **GET** List forum posts - https://docs.whop.com/api-reference/forum-posts/list-forum-posts
- **POST** Create forum post - https://docs.whop.com/api-reference/forum-posts/create-forum-post
- **GET** Retrieve forum post - https://docs.whop.com/api-reference/forum-posts/retrieve-forum-post

### Forums
- **GET** List forums - https://docs.whop.com/api-reference/forums/list-forums
- **GET** Retrieve forum - https://docs.whop.com/api-reference/forums/retrieve-forum
- **PATCH** Update forum - https://docs.whop.com/api-reference/forums/update-forum

### Messages
- **GET** List messages - https://docs.whop.com/api-reference/messages/list-messages
- **POST** Create message - https://docs.whop.com/api-reference/messages/create-message
- **GET** Retrieve message - https://docs.whop.com/api-reference/messages/retrieve-message

### Chat Channels
- **GET** List chat channels - https://docs.whop.com/api-reference/chat-channels/list-chat-channels
- **GET** Retrieve chat channel - https://docs.whop.com/api-reference/chat-channels/retrieve-chat-channel
- **PATCH** Update chat channel - https://docs.whop.com/api-reference/chat-channels/update-chat-channel

### Support Channels
- **GET** List support channels - https://docs.whop.com/api-reference/support-channels/list-support-channels
- **POST** Create support channel - https://docs.whop.com/api-reference/support-channels/create-support-channel
- **GET** Retrieve support channel - https://docs.whop.com/api-reference/support-channels/retrieve-support-channel

### Reactions
- **GET** List reactions - https://docs.whop.com/api-reference/reactions/list-reactions
- **POST** Create reaction - https://docs.whop.com/api-reference/reactions/create-reaction
- **GET** Retrieve reaction - https://docs.whop.com/api-reference/reactions/retrieve-reaction

### Course Lesson Interactions
- **GET** List course lesson interactions - https://docs.whop.com/api-reference/course-lesson-interactions/list-course-lesson-interactions
- **GET** Retrieve course lesson interaction - https://docs.whop.com/api-reference/course-lesson-interactions/retrieve-course-lesson-interaction

## Developer

### Apps
- **GET** List apps - https://docs.whop.com/api-reference/apps/list-apps
- **POST** Create app - https://docs.whop.com/api-reference/apps/create-app
- **GET** Retrieve app - https://docs.whop.com/api-reference/apps/retrieve-app
- **PATCH** Update app - https://docs.whop.com/api-reference/apps/update-app

### App Builds
- **GET** List app builds - https://docs.whop.com/api-reference/app-builds/list-app-builds
- **POST** Create app build - https://docs.whop.com/api-reference/app-builds/create-app-build
- **GET** Retrieve app build - https://docs.whop.com/api-reference/app-builds/retrieve-app-build
- **POST** Promote app build - https://docs.whop.com/api-reference/app-builds/promote-app-build

## Summary by Category

### Payments (7 sections, 28 endpoints)
- Products: 5 endpoints (CRUD + List)
- Plans: 5 endpoints (CRUD + List)
- Payments: 5 endpoints (List, Retrieve, Refund, Retry, Void)
- Invoices: 8 endpoints (4 API + 4 Webhooks)
- Transfers: 3 endpoints (List, Create, Retrieve)
- Ledger accounts: 1 endpoint (Retrieve)
- Checkout configurations: 3 endpoints (List, Create, Retrieve)

### Admin (6 sections, 20 endpoints)
- Companies: 1 endpoint (Retrieve)
- Members: 2 endpoints (List, Retrieve)
- Memberships: 6 endpoints (List, Retrieve, Update, Cancel, Pause, Resume)
- Entries: 4 endpoints (List, Retrieve, Approve, Deny)
- Shipments: 3 endpoints (List, Create, Retrieve)
- Authorized users: 2 endpoints (List, Retrieve)

### Content (9 sections, 22 endpoints)
- Users: 2 endpoints (Retrieve, Check access)
- Experiences: 7 endpoints (CRUD + List + Attach/Detach)
- Forum posts: 3 endpoints (List, Create, Retrieve)
- Forums: 3 endpoints (List, Retrieve, Update)
- Messages: 3 endpoints (List, Create, Retrieve)
- Chat channels: 3 endpoints (List, Retrieve, Update)
- Support channels: 3 endpoints (List, Create, Retrieve)
- Reactions: 3 endpoints (List, Create, Retrieve)
- Course lesson interactions: 2 endpoints (List, Retrieve)

### Developer (2 sections, 8 endpoints)
- Apps: 4 endpoints (CRUD + List)
- App builds: 4 endpoints (List, Create, Retrieve, Promote)

## Total: 78 REST API Endpoints

## SDK Installation

```bash
npm install @whop/api
# or
bun add @whop/api
```

## Basic Usage

```typescript
import { WhopServerSdk, verifyUserToken } from '@whop/api';

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});

// Example: Get experience
const experience = await whop.experiences.getExperience({ experienceId });

// Example: Create checkout session
const checkout = await whop.payments.createCheckoutSession({
  planId: 'plan_xxxxx'
});

// Example: Verify user (import verifyUserToken separately)
const { userId } = await verifyUserToken(req.headers);
```

## Authentication

All endpoints require an API key in the header:
```
Authorization: Bearer your-api-key-here
```

Get your API key from: `/dashboard/developer`

## Pagination

Most list endpoints support cursor-based pagination:
- `after` - Returns elements after this cursor
- `before` - Returns elements before this cursor
- `first` - Number of elements to return (forward pagination)
- `last` - Number of elements to return (backward pagination)

Response includes `page_info`:
```json
{
  "page_info": {
    "end_cursor": "cursor_string",
    "start_cursor": "cursor_string",
    "has_next_page": true,
    "has_previous_page": false
  }
}
```

## Common Patterns

### CRUD Operations
Most resources follow RESTful patterns:
- **GET** `/resource` - List resources
- **POST** `/resource` - Create resource
- **GET** `/resource/{id}` - Retrieve specific resource
- **PATCH** `/resource/{id}` - Update resource
- **DELETE** `/resource/{id}` - Delete resource

### Webhooks
Invoice events provide webhook endpoints for real-time notifications:
- Invoice created
- Invoice paid
- Invoice past due
- Invoice voided

## Key Resources

### Products & Plans
Products (Access Passes) define what you're selling.
Plans define how customers pay (pricing, intervals, checkout links).

### Memberships vs Members
- **Member**: A user in a company (can have multiple memberships)
- **Membership**: Active subscription to a specific product/plan

### Experiences
App instances on a company. When an app is installed, it creates an experience.
Multiple experiences = multiple installations of the same app.

### Authorized Users
Team members/admins of a company with elevated permissions.

### Entries
Waitlist entries for products with waitlist release method.

## Notes

- All IDs use Whop's tag format (e.g., `app_xxxxx`, `biz_xxxxx`, `user_xxxxx`)
- Timestamps are in ISO 8601 format
- Currency codes follow ISO 4217 (USD, EUR, GBP, etc.)
- The SDK handles pagination automatically with async iterators

# Whop REST API - Complete Endpoint Reference

Source: https://docs.whop.com/api-reference/apps/list-apps

## Introduction

- **Getting Started**: https://docs.whop.com/apps/api/getting-started
- **Permissions**: https://docs.whop.com/apps/api/permissions

## Payments

### Products
- **GET** List products - https://docs.whop.com/api-reference/products/list-products
- **POST** Create product - https://docs.whop.com/api-reference/products/create-product
- **GET** Retrieve product - https://docs.whop.com/api-reference/products/retrieve-product
- **PATCH** Update product - https://docs.whop.com/api-reference/products/update-product
- **DELETE** Delete product - https://docs.whop.com/api-reference/products/delete-product

### Plans
- **GET** List plans - https://docs.whop.com/api-reference/plans/list-plans
- **POST** Create plan - https://docs.whop.com/api-reference/plans/create-plan
- **GET** Retrieve plan - https://docs.whop.com/api-reference/plans/retrieve-plan
- **PATCH** Update plan - https://docs.whop.com/api-reference/plans/update-plan
- **DELETE** Delete plan - https://docs.whop.com/api-reference/plans/delete-plan

### Payments
- **GET** List payments - https://docs.whop.com/api-reference/payments/list-payments
- **GET** Retrieve payment - https://docs.whop.com/api-reference/payments/retrieve-payment
- **POST** Refund payment - https://docs.whop.com/api-reference/payments/refund-payment
- **POST** Retry payment - https://docs.whop.com/api-reference/payments/retry-payment
- **POST** Void payment - https://docs.whop.com/api-reference/payments/void-payment

### Invoices
- **GET** List invoices - https://docs.whop.com/api-reference/invoices/list-invoices
- **POST** Create invoice - https://docs.whop.com/api-reference/invoices/create-invoice
- **GET** Retrieve invoice - https://docs.whop.com/api-reference/invoices/retrieve-invoice
- **POST** Void invoice - https://docs.whop.com/api-reference/invoices/void-invoice
- **WEBHOOK** Invoice created - https://docs.whop.com/api-reference/invoices/invoice-created
- **WEBHOOK** Invoice paid - https://docs.whop.com/api-reference/invoices/invoice-paid
- **WEBHOOK** Invoice past due - https://docs.whop.com/api-reference/invoices/invoice-past-due
- **WEBHOOK** Invoice voided - https://docs.whop.com/api-reference/invoices/invoice-voided

### Transfers
- **GET** List transfers - https://docs.whop.com/api-reference/transfers/list-transfers
- **POST** Create transfer - https://docs.whop.com/api-reference/transfers/create-transfer
- **GET** Retrieve transfer - https://docs.whop.com/api-reference/transfers/retrieve-transfer

### Ledger Accounts
- **GET** Retrieve ledger account - https://docs.whop.com/api-reference/ledger-accounts/retrieve-ledger-account

### Checkout Configurations
- **GET** List checkout configurations - https://docs.whop.com/api-reference/checkout-configurations/list-checkout-configurations
- **POST** Create checkout configuration - https://docs.whop.com/api-reference/checkout-configurations/create-checkout-configuration
- **GET** Retrieve checkout configuration - https://docs.whop.com/api-reference/checkout-configurations/retrieve-checkout-configuration

## Admin

### Companies
- **GET** Retrieve company - https://docs.whop.com/api-reference/companies/retrieve-company

### Members
- **GET** List members - https://docs.whop.com/api-reference/members/list-members
- **GET** Retrieve member - https://docs.whop.com/api-reference/members/retrieve-member

### Memberships
- **GET** List memberships - https://docs.whop.com/api-reference/memberships/list-memberships
- **GET** Retrieve membership - https://docs.whop.com/api-reference/memberships/retrieve-membership
- **PATCH** Update membership - https://docs.whop.com/api-reference/memberships/update-membership
- **POST** Cancel membership - https://docs.whop.com/api-reference/memberships/cancel-membership
- **POST** Pause membership - https://docs.whop.com/api-reference/memberships/pause-membership
- **POST** Resume membership - https://docs.whop.com/api-reference/memberships/resume-membership

### Entries
- **GET** List entries - https://docs.whop.com/api-reference/entries/list-entries
- **GET** Retrieve entry - https://docs.whop.com/api-reference/entries/retrieve-entry
- **POST** Approve entry - https://docs.whop.com/api-reference/entries/approve-entry
- **POST** Deny entry - https://docs.whop.com/api-reference/entries/deny-entry

### Shipments
- **GET** List shipments - https://docs.whop.com/api-reference/shipments/list-shipments
- **POST** Create shipment - https://docs.whop.com/api-reference/shipments/create-shipment
- **GET** Retrieve shipment - https://docs.whop.com/api-reference/shipments/retrieve-shipment

### Authorized Users
- **GET** List authorized users - https://docs.whop.com/api-reference/authorized-users/list-authorized-users
- **GET** Retrieve authorized user - https://docs.whop.com/api-reference/authorized-users/retrieve-authorized-user

## Content

### Users
- **GET** Retrieve user - https://docs.whop.com/api-reference/users/retrieve-user
- **GET** Check access - https://docs.whop.com/api-reference/users/check-access

### Experiences
- **GET** List experiences - https://docs.whop.com/api-reference/experiences/list-experiences
- **POST** Create experience - https://docs.whop.com/api-reference/experiences/create-experience
- **GET** Retrieve experience - https://docs.whop.com/api-reference/experiences/retrieve-experience
- **PATCH** Update experience - https://docs.whop.com/api-reference/experiences/update-experience
- **DELETE** Delete experience - https://docs.whop.com/api-reference/experiences/delete-experience
- **POST** Attach experience - https://docs.whop.com/api-reference/experiences/attach-experience
- **POST** Detach experience - https://docs.whop.com/api-reference/experiences/detach-experience

### Forum Posts
- **GET** List forum posts - https://docs.whop.com/api-reference/forum-posts/list-forum-posts
- **POST** Create forum post - https://docs.whop.com/api-reference/forum-posts/create-forum-post
- **GET** Retrieve forum post - https://docs.whop.com/api-reference/forum-posts/retrieve-forum-post

### Forums
- **GET** List forums - https://docs.whop.com/api-reference/forums/list-forums
- **GET** Retrieve forum - https://docs.whop.com/api-reference/forums/retrieve-forum
- **PATCH** Update forum - https://docs.whop.com/api-reference/forums/update-forum

### Messages
- **GET** List messages - https://docs.whop.com/api-reference/messages/list-messages
- **POST** Create message - https://docs.whop.com/api-reference/messages/create-message
- **GET** Retrieve message - https://docs.whop.com/api-reference/messages/retrieve-message

### Chat Channels
- **GET** List chat channels - https://docs.whop.com/api-reference/chat-channels/list-chat-channels
- **GET** Retrieve chat channel - https://docs.whop.com/api-reference/chat-channels/retrieve-chat-channel
- **PATCH** Update chat channel - https://docs.whop.com/api-reference/chat-channels/update-chat-channel

### Support Channels
- **GET** List support channels - https://docs.whop.com/api-reference/support-channels/list-support-channels
- **POST** Create support channel - https://docs.whop.com/api-reference/support-channels/create-support-channel
- **GET** Retrieve support channel - https://docs.whop.com/api-reference/support-channels/retrieve-support-channel

### Reactions
- **GET** List reactions - https://docs.whop.com/api-reference/reactions/list-reactions
- **POST** Create reaction - https://docs.whop.com/api-reference/reactions/create-reaction
- **GET** Retrieve reaction - https://docs.whop.com/api-reference/reactions/retrieve-reaction

### Course Lesson Interactions
- **GET** List course lesson interactions - https://docs.whop.com/api-reference/course-lesson-interactions/list-course-lesson-interactions
- **GET** Retrieve course lesson interaction - https://docs.whop.com/api-reference/course-lesson-interactions/retrieve-course-lesson-interaction

## Developer

### Apps
- **GET** List apps - https://docs.whop.com/api-reference/apps/list-apps
- **POST** Create app - https://docs.whop.com/api-reference/apps/create-app
- **GET** Retrieve app - https://docs.whop.com/api-reference/apps/retrieve-app
- **PATCH** Update app - https://docs.whop.com/api-reference/apps/update-app

### App Builds
- **GET** List app builds - https://docs.whop.com/api-reference/app-builds/list-app-builds
- **POST** Create app build - https://docs.whop.com/api-reference/app-builds/create-app-build
- **GET** Retrieve app build - https://docs.whop.com/api-reference/app-builds/retrieve-app-build
- **POST** Promote app build - https://docs.whop.com/api-reference/app-builds/promote-app-build

## Summary by Category

### Payments (7 sections, 28 endpoints)
- Products: 5 endpoints (CRUD + List)
- Plans: 5 endpoints (CRUD + List)
- Payments: 5 endpoints (List, Retrieve, Refund, Retry, Void)
- Invoices: 8 endpoints (4 API + 4 Webhooks)
- Transfers: 3 endpoints (List, Create, Retrieve)
- Ledger accounts: 1 endpoint (Retrieve)
- Checkout configurations: 3 endpoints (List, Create, Retrieve)

### Admin (6 sections, 20 endpoints)
- Companies: 1 endpoint (Retrieve)
- Members: 2 endpoints (List, Retrieve)
- Memberships: 6 endpoints (List, Retrieve, Update, Cancel, Pause, Resume)
- Entries: 4 endpoints (List, Retrieve, Approve, Deny)
- Shipments: 3 endpoints (List, Create, Retrieve)
- Authorized users: 2 endpoints (List, Retrieve)

### Content (9 sections, 22 endpoints)
- Users: 2 endpoints (Retrieve, Check access)
- Experiences: 7 endpoints (CRUD + List + Attach/Detach)
- Forum posts: 3 endpoints (List, Create, Retrieve)
- Forums: 3 endpoints (List, Retrieve, Update)
- Messages: 3 endpoints (List, Create, Retrieve)
- Chat channels: 3 endpoints (List, Retrieve, Update)
- Support channels: 3 endpoints (List, Create, Retrieve)
- Reactions: 3 endpoints (List, Create, Retrieve)
- Course lesson interactions: 2 endpoints (List, Retrieve)

### Developer (2 sections, 8 endpoints)
- Apps: 4 endpoints (CRUD + List)
- App builds: 4 endpoints (List, Create, Retrieve, Promote)

## Total: 78 REST API Endpoints

## SDK Installation

```bash
npm install @whop/api
# or
bun add @whop/api
```

## Basic Usage

```typescript
import { WhopServerSdk, verifyUserToken } from '@whop/api';

export const whop = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID,
  appApiKey: process.env.WHOP_API_KEY,
  onBehalfOfUserId: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});

// Example: Get experience
const experience = await whop.experiences.getExperience({ experienceId });

// Example: Create checkout session
const checkout = await whop.payments.createCheckoutSession({
  planId: 'plan_xxxxx'
});

// Example: Verify user (import verifyUserToken separately)
const { userId } = await verifyUserToken(req.headers);
```

## Authentication

All endpoints require an API key in the header:
```
Authorization: Bearer your-api-key-here
```

Get your API key from: `/dashboard/developer`

## Pagination

Most list endpoints support cursor-based pagination:
- `after` - Returns elements after this cursor
- `before` - Returns elements before this cursor
- `first` - Number of elements to return (forward pagination)
- `last` - Number of elements to return (backward pagination)

Response includes `page_info`:
```json
{
  "page_info": {
    "end_cursor": "cursor_string",
    "start_cursor": "cursor_string",
    "has_next_page": true,
    "has_previous_page": false
  }
}
```

## Common Patterns

### CRUD Operations
Most resources follow RESTful patterns:
- **GET** `/resource` - List resources
- **POST** `/resource` - Create resource
- **GET** `/resource/{id}` - Retrieve specific resource
- **PATCH** `/resource/{id}` - Update resource
- **DELETE** `/resource/{id}` - Delete resource

### Webhooks
Invoice events provide webhook endpoints for real-time notifications:
- Invoice created
- Invoice paid
- Invoice past due
- Invoice voided

## Key Resources

### Products & Plans
Products (Access Passes) define what you're selling.
Plans define how customers pay (pricing, intervals, checkout links).

### Memberships vs Members
- **Member**: A user in a company (can have multiple memberships)
- **Membership**: Active subscription to a specific product/plan

### Experiences
App instances on a company. When an app is installed, it creates an experience.
Multiple experiences = multiple installations of the same app.

### Authorized Users
Team members/admins of a company with elevated permissions.

### Entries
Waitlist entries for products with waitlist release method.

## Notes

- All IDs use Whop's tag format (e.g., `app_xxxxx`, `biz_xxxxx`, `user_xxxxx`)
- Timestamps are in ISO 8601 format
- Currency codes follow ISO 4217 (USD, EUR, GBP, etc.)
- The SDK handles pagination automatically with async iterators

