# create-whop-app

The fastest way to create a [Whop](https://whop.com) app with authentication, app credentials, and optional database setup - all configured automatically.

This CLI handles everything: authenticates you with Whop, creates your app, installs it on your company, generates the Next.js template with all required environment variables, and optionally sets up a SQLite database with Drizzle ORM (upgradable to Turso).

## Usage

Works with any package manager:

```bash
npx create-whop-app@latest
# or
pnpm dlx create-whop-app@latest
# or
bunx create-whop-app@latest
# or
yarn create whop-app
```

### Ships with WhopCTL

Every generated project automatically installs [`@whoplabs/whopctl`](https://www.npmjs.com/package/@whoplabs/whopctl) and exposes a few package scripts so you can deploy immediately:

```
npm run deploy   # whopctl deploy
npm run status   # whopctl status
npm run logs     # whopctl logs app --follow
```

Because `create-whop-app` signs you into Whop before scaffolding, the CLI picks up the same session and “just works”.

## Features

- Automated Whop authentication with OTP
- Creates and installs app in one command
- Auto-configures environment variables
- Optional SQLite/Turso database with Drizzle ORM

---

Made by [Whop Labs](https://whop.com/whoplabs-main/) · Follow us on [𝕏](https://x.com/wheblabs)
