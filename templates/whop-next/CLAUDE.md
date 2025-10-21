---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.


# Whop API - Instructions for LLM Agents

## Critical: Use ONLY the Recommended API Package

**Package**: `@whop/api`  
**Documentation**: https://docs.whop.com/apps/api/getting-started  
**Status**: ✅ Recommended - contains full functionality including features missing in newer SDK

### DO Use
- `@whop/api` package (complete REST API implementation)
- Snake_case property names (`company_id`, `base_url`, `product_id`)
- Official documentation at https://docs.whop.com/

### DO NOT Use
- ⚠️ `@whop/sdk` package (newer but missing some functionality)
- ❌ GraphQL SDK (deprecated)
- ❌ API v2 (deprecated)
- ❌ API v5 (deprecated)
- ❌ Internal GraphQL API (not public, unsupported)
- ❌ CamelCase property names in REST API calls

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
- Package name: `@whop/api`
- Specific methods: `client.products.create`, `client.plans.update`
- Error messages you're encountering
- Feature combinations: "Whop API create product with multiple plans"
- Integration patterns: "Whop webhook invoice paid handle"

## SDK Structure

### Client Initialization
```typescript
import { WhopAPI } from '@whop/api';

const client = new WhopAPI({
  appID: 'app_xxxxxxxxxxxxxx',
  apiKey: process.env.WHOP_API_KEY,
});
```

### Resource Methods Pattern
All resources follow the same pattern:

```typescript
// List resources (returns async iterator)
for await (const item of client.resource.list(params)) {
  // Process items
}

// Create resource
const created = await client.resource.create(data);

// Retrieve resource
const item = await client.resource.retrieve(id);

// Update resource
const updated = await client.resource.update(id, data);

// Delete resource (where available)
await client.resource.delete(id);
```

### Available Resources
```typescript
client.apps
client.appBuilds
client.products
client.plans
client.payments
client.invoices
client.transfers
client.ledgerAccounts
client.checkoutConfigurations
client.companies
client.members
client.memberships
client.entries
client.shipments
client.authorizedUsers
client.users
client.experiences
client.forumPosts
client.forums
client.messages
client.chatChannels
client.supportChannels
client.reactions
client.courseLessonInteractions
```

## Common Mistakes to Avoid

### ❌ Wrong: Using camelCase
```typescript
await client.products.create({
  companyId: "biz_123",    // Wrong!
  baseUrl: "https://..."   // Wrong!
});
```

### ✅ Correct: Using snake_case
```typescript
await client.products.create({
  company_id: "biz_123",   // Correct
  base_url: "https://..."  // Correct
});
```

### ❌ Wrong: Using limited SDK
```typescript
import Whop from '@whop/sdk';  // Missing some functionality!
```

### ✅ Correct: Using complete API package
```typescript
import { WhopAPI } from '@whop/api';  // Recommended
```

### ❌ Wrong: Manual pagination
```typescript
let cursor = null;
while (true) {
  const response = await fetch(`/api?after=${cursor}`);
  // Manual handling...
}
```

### ✅ Correct: Async iterator pagination
```typescript
for await (const item of client.products.list()) {
  // SDK handles pagination automatically
}
```

## Error Handling

```typescript
try {
  const plan = await client.plans.create({
    product_id: "prod_123",
    title: "Monthly Plan",
    renewal_price: 29.99,
    base_currency: "USD",
    billing_period: 30
  });
} catch (error) {
  if (error.statusCode === 422) {
    console.error('Validation error:', error.message);
  } else if (error.statusCode === 404) {
    console.error('Product not found');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Quick Reference

### Product Creation Flow
```typescript
// 1. Create product
const product = await client.products.create({
  title: "My Product",
  company_id: "biz_123",
  visibility: "visible"
});

// 2. Create plan
const plan = await client.plans.create({
  product_id: product.id,
  title: "Monthly",
  plan_type: "renewal",
  renewal_price: 29.99,
  base_currency: "USD",
  billing_period: 30
});

// 3. Share checkout link
console.log(plan.direct_link);
```

### App Creation Flow
```typescript
// 1. Create app
const app = await client.apps.create({
  name: "My App",
  base_url: "https://myapp.com",
  company_id: "biz_123"
});

// 2. Update app configuration
await client.apps.update(app.id, {
  base_dev_url: "http://localhost:3000",
  description: "My app description"
});
```

## Support & Resources

- **Official Docs**: https://docs.whop.com/
- **API Reference**: https://docs.whop.com/api-reference/
- **API Package**: https://www.npmjs.com/package/@whop/api
- **Getting Started**: https://docs.whop.com/apps/api/getting-started
- **Permissions Guide**: https://docs.whop.com/apps/api/permissions

## Summary for LLM Agents

1. **ALWAYS** use `@whop/api` - it contains full functionality
2. **ALWAYS** use `snake_case` for REST API property names
3. **CHECK** official docs first: https://docs.whop.com/
4. **USE** Exa MCP when docs are insufficient or unclear
5. **REMEMBER** the terminology mappings (Product = Access Pass, Plan = Checkout Link)
6. **VALIDATE** routes: lowercase, alphanumeric, hyphens only, 2-100 chars
7. **HANDLE** errors properly with try/catch
8. **LEVERAGE** async iterators for pagination
9. **TEST** thoroughly before deploying

When in doubt, consult the official documentation or use Exa MCP to find real-world examples and patterns.

# Whop API - Instructions for LLM Agents

## Critical: Use ONLY the Recommended API Package

**Package**: `@whop/api`  
**Documentation**: https://docs.whop.com/apps/api/getting-started  
**Status**: ✅ Recommended - contains full functionality including features missing in newer SDK

### DO Use
- `@whop/api` package (complete REST API implementation)
- Snake_case property names (`company_id`, `base_url`, `product_id`)
- Official documentation at https://docs.whop.com/

### DO NOT Use
- ⚠️ `@whop/sdk` package (newer but missing some functionality)
- ❌ GraphQL SDK (deprecated)
- ❌ API v2 (deprecated)
- ❌ API v5 (deprecated)
- ❌ Internal GraphQL API (not public, unsupported)
- ❌ CamelCase property names in REST API calls

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
- Package name: `@whop/api`
- Specific methods: `client.products.create`, `client.plans.update`
- Error messages you're encountering
- Feature combinations: "Whop API create product with multiple plans"
- Integration patterns: "Whop webhook invoice paid handle"

## SDK Structure

### Client Initialization
```typescript
import { WhopAPI } from '@whop/api';

const client = new WhopAPI({
  appID: 'app_xxxxxxxxxxxxxx',
  apiKey: process.env.WHOP_API_KEY,
});
```

### Resource Methods Pattern
All resources follow the same pattern:

```typescript
// List resources (returns async iterator)
for await (const item of client.resource.list(params)) {
  // Process items
}

// Create resource
const created = await client.resource.create(data);

// Retrieve resource
const item = await client.resource.retrieve(id);

// Update resource
const updated = await client.resource.update(id, data);

// Delete resource (where available)
await client.resource.delete(id);
```

### Available Resources
```typescript
client.apps
client.appBuilds
client.products
client.plans
client.payments
client.invoices
client.transfers
client.ledgerAccounts
client.checkoutConfigurations
client.companies
client.members
client.memberships
client.entries
client.shipments
client.authorizedUsers
client.users
client.experiences
client.forumPosts
client.forums
client.messages
client.chatChannels
client.supportChannels
client.reactions
client.courseLessonInteractions
```

## Common Mistakes to Avoid

### ❌ Wrong: Using camelCase
```typescript
await client.products.create({
  companyId: "biz_123",    // Wrong!
  baseUrl: "https://..."   // Wrong!
});
```

### ✅ Correct: Using snake_case
```typescript
await client.products.create({
  company_id: "biz_123",   // Correct
  base_url: "https://..."  // Correct
});
```

### ❌ Wrong: Using limited SDK
```typescript
import Whop from '@whop/sdk';  // Missing some functionality!
```

### ✅ Correct: Using complete API package
```typescript
import { WhopAPI } from '@whop/api';  // Recommended
```

### ❌ Wrong: Manual pagination
```typescript
let cursor = null;
while (true) {
  const response = await fetch(`/api?after=${cursor}`);
  // Manual handling...
}
```

### ✅ Correct: Async iterator pagination
```typescript
for await (const item of client.products.list()) {
  // SDK handles pagination automatically
}
```

## Error Handling

```typescript
try {
  const plan = await client.plans.create({
    product_id: "prod_123",
    title: "Monthly Plan",
    renewal_price: 29.99,
    base_currency: "USD",
    billing_period: 30
  });
} catch (error) {
  if (error.statusCode === 422) {
    console.error('Validation error:', error.message);
  } else if (error.statusCode === 404) {
    console.error('Product not found');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Quick Reference

### Product Creation Flow
```typescript
// 1. Create product
const product = await client.products.create({
  title: "My Product",
  company_id: "biz_123",
  visibility: "visible"
});

// 2. Create plan
const plan = await client.plans.create({
  product_id: product.id,
  title: "Monthly",
  plan_type: "renewal",
  renewal_price: 29.99,
  base_currency: "USD",
  billing_period: 30
});

// 3. Share checkout link
console.log(plan.direct_link);
```

### App Creation Flow
```typescript
// 1. Create app
const app = await client.apps.create({
  name: "My App",
  base_url: "https://myapp.com",
  company_id: "biz_123"
});

// 2. Update app configuration
await client.apps.update(app.id, {
  base_dev_url: "http://localhost:3000",
  description: "My app description"
});
```

## Support & Resources

- **Official Docs**: https://docs.whop.com/
- **API Reference**: https://docs.whop.com/api-reference/
- **API Package**: https://www.npmjs.com/package/@whop/api
- **Getting Started**: https://docs.whop.com/apps/api/getting-started
- **Permissions Guide**: https://docs.whop.com/apps/api/permissions

## Summary for LLM Agents

1. **ALWAYS** use `@whop/api` - it contains full functionality
2. **ALWAYS** use `snake_case` for REST API property names
3. **CHECK** official docs first: https://docs.whop.com/
4. **USE** Exa MCP when docs are insufficient or unclear
5. **REMEMBER** the terminology mappings (Product = Access Pass, Plan = Checkout Link)
6. **VALIDATE** routes: lowercase, alphanumeric, hyphens only, 2-100 chars
7. **HANDLE** errors properly with try/catch
8. **LEVERAGE** async iterators for pagination
9. **TEST** thoroughly before deploying

When in doubt, consult the official documentation or use Exa MCP to find real-world examples and patterns.


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

1. **Create the app** under your company
   ```typescript
   import { WhopAPI } from '@whop/api';
   
   const client = new WhopAPI({
     appID: 'app_xxxxxxxxxxxxxx',
     apiKey: process.env.WHOP_API_KEY,
   });
   
   const app = await client.apps.create({
     name: "My App",
     base_url: "https://myapp.com",
     company_id: "biz_123"
   });
   ```

2. **Configure app settings**
   ```typescript
   await client.apps.update(app.id, {
     base_url: "https://myapp.com",
     base_dev_url: "http://localhost:3000",
     base_preview_url: "https://staging.myapp.com",
     description: "My app description",
     icon: "attachment_id_here"
   });
   ```

3. **Submit for review**
   - Apps must be reviewed before appearing in the App Store
   - Once approved, other creators can install your app

4. **Handle installations**
   - When installed, your app receives an experience ID
   - Use webhooks to track installations/uninstallations
   - Configure experience-specific settings

### Paywalling Your App

1. **Create an access pass** for your app features
   ```typescript
   const product = await client.products.create({
     title: "Premium Features",
     company_id: "biz_123",
     description: "Access to premium features",
     visibility: "visible"
   });
   ```

2. **Create plans** (checkout links) with pricing
   ```typescript
   const plan = await client.plans.create({
     product_id: product.id,
     title: "Monthly Subscription",
     plan_type: "renewal",
     renewal_price: 29.99,
     base_currency: "USD",
     billing_period: 30,
     visibility: "visible"
   });
   
   console.log('Checkout link:', plan.direct_link);
   ```

3. **Check user access** in your app code
   ```typescript
   const hasAccess = await client.users.checkAccess(userId, {
     product_id: product.id
   });
   ```

4. **Gate features** based on membership status

### Using the Agent User

Apps receive `NEXT_PUBLIC_WHOP_AGENT_USER_ID` environment variable:
- Use this to send automated DMs
  ```typescript
  await client.messages.create({
    user_id: client.agentUserId, // From NEXT_PUBLIC_WHOP_AGENT_USER_ID
    recipient_id: "user_123",
    text: "Welcome to our community!"
  });
  ```
- Build chatbots and notification systems
- Automate welcome messages, reminders, alerts
- Respond to user actions programmatically

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
import { WhopAPI } from '@whop/api';

const client = new WhopAPI({
  appID: 'app_xxxxxxxxxxxxxx',
  apiKey: process.env.WHOP_API_KEY,
});

// Create product (access pass)
const product = await client.products.create({
  title: "Premium Membership",
  company_id: "biz_123",
  description: "Full access to all features",
  visibility: "visible"
});

// Create plan
const plan = await client.plans.create({
  product_id: product.id,
  title: "Monthly Plan",
  plan_type: "renewal",
  renewal_price: 29.99,
  base_currency: "USD",
  billing_period: 30,
  visibility: "visible"
});

// The checkout URL
console.log(plan.direct_link); // https://whop.com/checkout/plan_xxxxx
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

### List Products on a Company
```typescript
const products = await client.products.list({
  company_id: "biz_123"
});

for await (const product of products) {
  console.log(product.id, product.title);
}
```

### List Plans for a Product
```typescript
const plans = await client.plans.list({
  product_id: "prod_xyz789"
});

for await (const plan of plans) {
  console.log(plan.id, plan.direct_link);
}
```

### Update a Plan
```typescript
await client.plans.update("plan_abc123", {
  title: "Updated Monthly Plan",
  renewal_price: 39.99,
  visibility: "visible"
});
```

### List Members of a Company
```typescript
const members = await client.members.list({
  company_id: "biz_123"
});

for await (const member of members) {
  console.log(member.user.username, member.access_level);
}
```

### Create a Forum Post
```typescript
const post = await client.forumPosts.create({
  forum_id: "forum_123",
  title: "Welcome!",
  content: "Welcome to our community"
});
```

### Send a DM as Agent User
```typescript
await client.messages.create({
  user_id: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  recipient_id: "user_456",
  text: "Thanks for joining! How can we help?"
});
```

### List Experiences for an App
```typescript
const experiences = await client.experiences.list({
  app_id: "app_123"
});

for await (const exp of experiences) {
  console.log(exp.id, exp.company.title);
}
```

## Best Practices

1. **Always use the public REST API** (`@whop/api`) for app development
2. **Use snake_case for property names** - The REST API uses `company_id`, not `companyId`
3. **Handle webhooks** to stay in sync with installations and payments
4. **Implement proper error handling** for API calls
5. **Cache user permissions** to avoid excessive API calls
6. **Use the agent user** for automated messaging features
7. **Test paywalling** thoroughly before launch
8. **Follow OAuth best practices** for user authentication
9. **Monitor API rate limits** and implement backoff strategies
10. **Use async iterators** for pagination - The SDK handles it automatically

## Notes for LLM Agents

### API Usage
- The internal GraphQL API discussed in this conversation is NOT for public use
- When building Whop apps, ONLY use `@whop/api` (REST API)
- **REST API uses snake_case** for all property names: `company_id`, `base_url`, `product_id`, etc.
- **GraphQL API uses camelCase**: `companyId`, `baseUrl`, `productId`, etc.

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
import { WhopAPI } from '@whop/api';

const client = new WhopAPI({
  appID: 'app_xxxxxxxxxxxxxx',    // Your app ID
  apiKey: process.env.WHOP_API_KEY, // Your API key
});
```

### Pagination Pattern
The SDK uses async iterators for automatic pagination:
```typescript
// Automatically handles pagination
for await (const item of client.products.list()) {
  console.log(item.id);
}
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

1. **Create the app** under your company
   ```typescript
   import { WhopAPI } from '@whop/api';
   
   const client = new WhopAPI({
     appID: 'app_xxxxxxxxxxxxxx',
     apiKey: process.env.WHOP_API_KEY,
   });
   
   const app = await client.apps.create({
     name: "My App",
     base_url: "https://myapp.com",
     company_id: "biz_123"
   });
   ```

2. **Configure app settings**
   ```typescript
   await client.apps.update(app.id, {
     base_url: "https://myapp.com",
     base_dev_url: "http://localhost:3000",
     base_preview_url: "https://staging.myapp.com",
     description: "My app description",
     icon: "attachment_id_here"
   });
   ```

3. **Submit for review**
   - Apps must be reviewed before appearing in the App Store
   - Once approved, other creators can install your app

4. **Handle installations**
   - When installed, your app receives an experience ID
   - Use webhooks to track installations/uninstallations
   - Configure experience-specific settings

### Paywalling Your App

1. **Create an access pass** for your app features
   ```typescript
   const product = await client.products.create({
     title: "Premium Features",
     company_id: "biz_123",
     description: "Access to premium features",
     visibility: "visible"
   });
   ```

2. **Create plans** (checkout links) with pricing
   ```typescript
   const plan = await client.plans.create({
     product_id: product.id,
     title: "Monthly Subscription",
     plan_type: "renewal",
     renewal_price: 29.99,
     base_currency: "USD",
     billing_period: 30,
     visibility: "visible"
   });
   
   console.log('Checkout link:', plan.direct_link);
   ```

3. **Check user access** in your app code
   ```typescript
   const hasAccess = await client.users.checkAccess(userId, {
     product_id: product.id
   });
   ```

4. **Gate features** based on membership status

### Using the Agent User

Apps receive `NEXT_PUBLIC_WHOP_AGENT_USER_ID` environment variable:
- Use this to send automated DMs
  ```typescript
  await client.messages.create({
    user_id: client.agentUserId, // From NEXT_PUBLIC_WHOP_AGENT_USER_ID
    recipient_id: "user_123",
    text: "Welcome to our community!"
  });
  ```
- Build chatbots and notification systems
- Automate welcome messages, reminders, alerts
- Respond to user actions programmatically

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
import { WhopAPI } from '@whop/api';

const client = new WhopAPI({
  appID: 'app_xxxxxxxxxxxxxx',
  apiKey: process.env.WHOP_API_KEY,
});

// Create product (access pass)
const product = await client.products.create({
  title: "Premium Membership",
  company_id: "biz_123",
  description: "Full access to all features",
  visibility: "visible"
});

// Create plan
const plan = await client.plans.create({
  product_id: product.id,
  title: "Monthly Plan",
  plan_type: "renewal",
  renewal_price: 29.99,
  base_currency: "USD",
  billing_period: 30,
  visibility: "visible"
});

// The checkout URL
console.log(plan.direct_link); // https://whop.com/checkout/plan_xxxxx
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

### List Products on a Company
```typescript
const products = await client.products.list({
  company_id: "biz_123"
});

for await (const product of products) {
  console.log(product.id, product.title);
}
```

### List Plans for a Product
```typescript
const plans = await client.plans.list({
  product_id: "prod_xyz789"
});

for await (const plan of plans) {
  console.log(plan.id, plan.direct_link);
}
```

### Update a Plan
```typescript
await client.plans.update("plan_abc123", {
  title: "Updated Monthly Plan",
  renewal_price: 39.99,
  visibility: "visible"
});
```

### List Members of a Company
```typescript
const members = await client.members.list({
  company_id: "biz_123"
});

for await (const member of members) {
  console.log(member.user.username, member.access_level);
}
```

### Create a Forum Post
```typescript
const post = await client.forumPosts.create({
  forum_id: "forum_123",
  title: "Welcome!",
  content: "Welcome to our community"
});
```

### Send a DM as Agent User
```typescript
await client.messages.create({
  user_id: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  recipient_id: "user_456",
  text: "Thanks for joining! How can we help?"
});
```

### List Experiences for an App
```typescript
const experiences = await client.experiences.list({
  app_id: "app_123"
});

for await (const exp of experiences) {
  console.log(exp.id, exp.company.title);
}
```

## Best Practices

1. **Always use the public REST API** (`@whop/api`) for app development
2. **Use snake_case for property names** - The REST API uses `company_id`, not `companyId`
3. **Handle webhooks** to stay in sync with installations and payments
4. **Implement proper error handling** for API calls
5. **Cache user permissions** to avoid excessive API calls
6. **Use the agent user** for automated messaging features
7. **Test paywalling** thoroughly before launch
8. **Follow OAuth best practices** for user authentication
9. **Monitor API rate limits** and implement backoff strategies
10. **Use async iterators** for pagination - The SDK handles it automatically

## Notes for LLM Agents

### API Usage
- The internal GraphQL API discussed in this conversation is NOT for public use
- When building Whop apps, ONLY use `@whop/api` (REST API)
- **REST API uses snake_case** for all property names: `company_id`, `base_url`, `product_id`, etc.
- **GraphQL API uses camelCase**: `companyId`, `baseUrl`, `productId`, etc.

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
import { WhopAPI } from '@whop/api';

const client = new WhopAPI({
  appID: 'app_xxxxxxxxxxxxxx',    // Your app ID
  apiKey: process.env.WHOP_API_KEY, // Your API key
});
```

### Pagination Pattern
The SDK uses async iterators for automatic pagination:
```typescript
// Automatically handles pagination
for await (const item of client.products.list()) {
  console.log(item.id);
}
```


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
```

## Basic Usage

```javascript
import { WhopAPI } from '@whop/api';

const client = new WhopAPI({
  appID: 'app_xxxxxxxxxxxxxx',
  apiKey: 'your-api-key',
});

// Example: List products
const products = await client.products.list();

// Example: Create a plan
const plan = await client.plans.create({
  product_id: 'prod_xxxxx',
  price: 29.99,
  interval: 'month'
});
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
```

## Basic Usage

```javascript
import { WhopAPI } from '@whop/api';

const client = new WhopAPI({
  appID: 'app_xxxxxxxxxxxxxx',
  apiKey: 'your-api-key',
});

// Example: List products
const products = await client.products.list();

// Example: Create a plan
const plan = await client.plans.create({
  product_id: 'prod_xxxxx',
  price: 29.99,
  interval: 'month'
});
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

