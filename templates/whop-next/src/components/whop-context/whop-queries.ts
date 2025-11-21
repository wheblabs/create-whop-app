import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { env } from '~/env'
import type { WhopAccess, WhopExperience, WhopUser } from '~/lib/whop'

export const serverQueryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // 1 minute
			retry: 1,
		},
		dehydrate: {
			shouldDehydrateQuery: (query) =>
				defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
		},
	},
})

export function getApiUrl(path: string): string {
	if (typeof window === 'undefined') {
		return `${env.NEXT_PUBLIC_VERCEL_URL}${path}`
	}
	return path
}

/**
 * Get headers for server-side fetch requests
 * Forwards Whop authentication headers from the incoming request
 */
function getServerHeaders(): HeadersInit {
	if (typeof window !== 'undefined') {
		return {}
	}

	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const { headers } = require('next/headers')
		const incoming = headers()
		const forwarded: Record<string, string> = {}
		
		const WHOP_HEADER_KEYS = [
			'x-whop-access-token',
			'x-whop-refresh-token',
			'x-whop-csrf-token',
			'x-whop-user-token',
		]
		
		for (const key of WHOP_HEADER_KEYS) {
			const value = incoming.get(key)
			if (value) {
				forwarded[key] = value
			}
		}
		
		return forwarded
	} catch {
		return {}
	}
}

export const whopExperienceQuery = (experienceId: string) => ({
	queryKey: ['experience', experienceId],
	queryFn: async () => {
		const response = await fetch(getApiUrl(`/api/experience/${experienceId}`), {
			headers: getServerHeaders(),
		})
		if (!response.ok) throw new Error('Failed to fetch whop experience')
		const result = (await response.json()) as WhopExperience
		return result
	},
})

export const whopUserQuery = (experienceId: string) => ({
	queryKey: ['user', experienceId],
	queryFn: async () => {
		const response = await fetch(getApiUrl(`/api/experience/${experienceId}/user`), {
			headers: getServerHeaders(),
		})
		if (!response.ok) throw new Error('Failed to fetch whop user')
		return response.json() as Promise<{ user: WhopUser; access: WhopAccess }>
	},
})

export const receiptsQuery = () => ({
	queryKey: ['receipts'],
	queryFn: async () => {
		const response = await fetch(getApiUrl('/api/receipts'), {
			headers: getServerHeaders(),
		})
		if (!response.ok) throw new Error('Failed to fetch receipts')
		return response.json() as Promise<{
			accessPasses: Array<{
				id: string
				type: 'one-time' | 'subscription'
				receipts: Array<{
					amountPaid: number
					paidAt: string
					subscriptionStatus?: string | null
					membershipId?: string | null
					member?: {
						id: string
					} | null
				}>
			}>
		}>
	},
})
