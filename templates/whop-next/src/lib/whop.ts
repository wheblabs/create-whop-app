import { env } from '~/env'
import Whop from '@whop/sdk'

// export const whop = WhopServerSdk({
//   appId: env.WHOP_API_KEY,
//   appApiKey: env.WHOP_API_KEY,
//   onBehalfOfUserId: env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
//   companyId: env.NEXT_PUBLIC_WHOP_COMPANY_ID,
// })

export const whop = new Whop({
  appID: env.WHOP_API_KEY,
  apiKey: env.WHOP_API_KEY,
})
