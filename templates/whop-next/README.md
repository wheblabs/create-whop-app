# Whop App

This is a Whop app created with [`create-whop-app`](https://github.com/whopio/create-whop-app), built on Next.js and optimized for Bun.

## 🚀 Getting Started

Your app is ready to run! If the CLI already started your dev server, you can access it at [http://localhost:3000](http://localhost:3000).

If you need to start it manually:

```bash
bun dev
```

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── (whop-api)/          # Whop API routes
│   │   │   └── api/
│   │   │       └── experience/
│   │   ├── experiences/          # Your app pages
│   │   │   └── [experienceId]/
│   │   └── globals.css
│   ├── components/
│   │   └── whop-context/         # Whop SDK context & hooks
│   ├── lib/
│   │   └── whop.ts               # Whop SDK client setup
│   └── env.ts                    # Environment validation
├── .env                          # Your environment variables
└── package.json
```

## 🔧 Setting Up Your Whop App in the Dashboard

Before your app can be installed and used, you need to configure it in the Whop dashboard:

### 1. Create or Access Your App

1. Go to [Whop Developer Dashboard](https://whop.com/dashboard)
2. Click "Developer" in the left sidebar (at the bottom)
3. Create a new app or select your existing app

![1759855227398](https://imagedelivery.net/jkJ-8epQpRzUjpjX1rR9jQ/4f654981-d4e7-4029-dc0f-83b2374ce900/public)

### 2. Install your app

1. In your app dashboard, find the **Installation Link** section
2. Click on the installation button
3. Select your whop community and click install. This will open the app as well.

![1759855491970](https://imagedelivery.net/jkJ-8epQpRzUjpjX1rR9jQ/00cee47f-a12a-4f3a-86b4-7c4551dd8f00/public)
![1759855625621](https://imagedelivery.net/jkJ-8epQpRzUjpjX1rR9jQ/4a3b8650-9af8-407f-c7f1-535a8cb62100/public)

### 3. Configure your app to start developing

1. Open your app after you installed it.
2. Find the development badge in the corner of your app (Top right by default) and click it.
3. Set the environment to "Local".

![1759856246380](https://imagedelivery.net/jkJ-8epQpRzUjpjX1rR9jQ/d17d4d1b-e8fe-4dbc-98ea-e882eaa67400/public)

## 🏗️ What's Included

This template comes with:

- **Whop SDK** (`@whop/api`) - Pre-configured client for Whop API
- **Whop Context** - React hooks for accessing Whop data in your components
- **Experience-based routing** - Pages that map to Whop experiences (installations)
- **API routes** - Server-side endpoints for Whop integration
- **Environment validation** - Type-safe environment variables with Zod
- **Bun** - Fast runtime and package manager

## 🛠️ Development

### Environment Variables

Your `.env` file should already be configured with:

```env
WHOP_API_KEY=your_api_key
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id
```

### Using the Whop SDK

The Whop SDK is initialized in `src/lib/whop.ts` and available throughout your app:

```typescript
import { whopSdk } from '@/lib/whop'

// Make API requests
const user = await whopSdk.users.getUser({ userId: 'user_123' })
```

### Using Whop Context

Access Whop data in your components using the Whop context:

```typescript
'use client'
import { useWhopUser } from '@/components/whop-context'

export default function MyComponent() {
  const { user } = useWhopUser()

  return <div>Hello {user.username}!</div>
}
```

## 📚 Learn More

### Whop Resources

- [Whop Apps Documentation](https://docs.whop.com/apps) - Complete guide to building Whop apps
- [Whop SDK Reference](https://docs.whop.com/sdk) - API reference for the Whop SDK
- [Whop Tutorials](https://docs.whop.com/apps/tutorials) - Step-by-step tutorials

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Next.js App Router](https://nextjs.org/docs/app) - Learn about the App Router

### Bun Resources

- [Bun Documentation](https://bun.sh/docs) - Learn about Bun's features
- [Bun API Reference](https://bun.sh/docs/api) - Built-in APIs and utilities

## 🚢 Deployment

When you're ready to deploy:

1. Deploy your app to your preferred hosting platform (Vercel, Cloudflare, etc.)
2. Update your `.env` variables in your hosting platform's environment settings
3. Update your Whop app's **Base URL** in the dashboard to your production URL

## 🤝 Support

- [Whop Labs](https://whop.com/whoplabs-main) - Get help directly from us
- [Whop Discord](https://discord.gg/whop) - Get help from the Whop community
- [Whop Support](https://whop.com/support) - Official Whop support
