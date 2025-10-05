import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { env } from '~/env'
import type { WhopExperience, WhopExperienceAccess, WhopUser } from './whop-context'

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

export const whopExperienceQuery = (experienceId: string) => ({
  queryKey: ['experience', experienceId],
  queryFn: async () => {
    const response = await fetch(getApiUrl(`/api/experience/${experienceId}`))
    if (!response.ok) throw new Error('Failed to fetch whop experience')
    const result = (await response.json()) as WhopExperience
    return result
  },
})

export const whopUserQuery = (experienceId: string) => ({
  queryKey: ['user', experienceId],
  queryFn: async () => {
    const response = await fetch(getApiUrl(`/api/experience/${experienceId}/user`))
    if (!response.ok) throw new Error('Failed to fetch whop user')
    return response.json() as Promise<{ user: WhopUser; access: WhopExperienceAccess }>
  },
})
