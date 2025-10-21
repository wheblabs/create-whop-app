# Create Whop App Instructions Site

This Cloudflare Worker serves the instructions page for create-whop-app.

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create the R2 bucket:
```bash
wrangler r2 bucket create create-whop-app-instructions
```

3. Upload the index.html to R2:
```bash
bun run upload
```

4. Deploy the worker:
```bash
bun run deploy
```

5. Configure the custom domain in Cloudflare dashboard:
   - Go to your worker settings
   - Add custom domain: `create-whop-app-instructions.whoplabs.io`

## Development

Run locally:
```bash
bun run dev
```

## Update Instructions

To update the instructions page:

1. Edit `index.html`
2. Upload to R2: `bun run upload`
3. The changes will be live immediately (cached for 1 hour)

