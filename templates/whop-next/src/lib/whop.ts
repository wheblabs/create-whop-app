import {
	type CheckIfUserHasAccessToExperienceQuery,
	type GetExperienceQuery,
	type GetUserQuery,
	WhopServerSdk,
} from '@whop/api'
import { env } from '~/env'

// Type exports from Whop API queries
export type WhopExperience = GetExperienceQuery['experience']
export type WhopUser = GetUserQuery['publicUser']
export type WhopAccess = CheckIfUserHasAccessToExperienceQuery['hasAccessToExperience']

// Initialize WhopServerSdk with app configuration
export const whop = WhopServerSdk({
	appId: env.NEXT_PUBLIC_WHOP_APP_ID,
	appApiKey: env.WHOP_API_KEY,
	onBehalfOfUserId: env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
	companyId: env.NEXT_PUBLIC_WHOP_COMPANY_ID,
})

// Note: For authentication in API routes, import verifyUserToken separately:
// import { verifyUserToken } from '@whop/api'
// const { userId } = await verifyUserToken(req.headers)

// This is for the new @whop/sdk package
// For the time being it has some missing features and is not recommended to use
// Oct 21, 2025
// import Whop from '@whop/sdk'
// export const whopClient = new Whop({
// 	appID: env.WHOP_API_KEY,
// 	apiKey: env.WHOP_API_KEY,
// })
