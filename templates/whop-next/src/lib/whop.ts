import { env } from '~/env'
import { WhopServerSdk } from '@whop/api'

export const whop = WhopServerSdk({
  appId: env.WHOP_API_KEY,
  appApiKey: env.WHOP_API_KEY,
  onBehalfOfUserId: env.NEXT_PUBLIC_WHOP_AGENT_USER_ID,
  companyId: env.NEXT_PUBLIC_WHOP_COMPANY_ID,
})
