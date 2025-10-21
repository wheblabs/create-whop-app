import { WhopServerSdk } from '@whop/api'
import { env } from '~/env'

export const whop = WhopServerSdk({
	appId: env.NEXT_PUBLIC_WHOP_APP_ID,
	appApiKey: env.WHOP_API_KEY,
	onBehalfOfUserId: env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
	companyId: env.NEXT_PUBLIC_WHOP_COMPANY_ID,
})

// This is for the new @whop/sdk package
// For the time being it has some missing features and is not recommended to use
// Oct 21, 2025

// import Whop from '@whop/sdk'
// export const whop = new Whop({
// 	appID: env.WHOP_API_KEY,
// 	apiKey: env.WHOP_API_KEY,
// })
