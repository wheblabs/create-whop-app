import { vercel } from '@t3-oss/env-core/presets-zod'
import { createEnv } from '@t3-oss/env-nextjs'
import z from 'zod'

export const env = createEnv({
	server: {
		WHOP_API_KEY: z.string(),

		// Whop Payments
		ONE_TIME_PURCHASE_ACCESS_PASS_PLAN_ID: z.string(),
		ONE_TIME_PURCHASE_ACCESS_PASS_ID: z.string(),
		SUBSCRIPTION_PURCHASE_ACCESS_PASS_PLAN_ID: z.string(),
		SUBSCRIPTION_PURCHASE_ACCESS_PASS_ID: z.string(),
	},
	client: {
		NEXT_PUBLIC_WHOP_APP_ID: z.string(),
		NEXT_PUBLIC_WHOP_AGENT_USER_ID: z.string(),
		NEXT_PUBLIC_WHOP_COMPANY_ID: z.string(),
		NEXT_PUBLIC_VERCEL_URL: z.string().default('http://localhost:3000'),
	},
	runtimeEnv: {
		// Server
		WHOP_API_KEY: process.env.WHOP_API_KEY,
		ONE_TIME_PURCHASE_ACCESS_PASS_PLAN_ID: process.env.ONE_TIME_PURCHASE_ACCESS_PASS_PLAN_ID,
		ONE_TIME_PURCHASE_ACCESS_PASS_ID: process.env.ONE_TIME_PURCHASE_ACCESS_PASS_ID,
		SUBSCRIPTION_PURCHASE_ACCESS_PASS_PLAN_ID:
			process.env.SUBSCRIPTION_PURCHASE_ACCESS_PASS_PLAN_ID,
		SUBSCRIPTION_PURCHASE_ACCESS_PASS_ID: process.env.SUBSCRIPTION_PURCHASE_ACCESS_PASS_ID,

		// Client
		NEXT_PUBLIC_WHOP_APP_ID: process.env.NEXT_PUBLIC_WHOP_APP_ID,
		NEXT_PUBLIC_WHOP_AGENT_USER_ID: process.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
		NEXT_PUBLIC_WHOP_COMPANY_ID: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
		NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
	},
	extends: [vercel()],
})
