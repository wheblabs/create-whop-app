'use client'

import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { WhopContext } from './whop-context'
import { whopExperienceQuery, whopUserQuery } from './whop-queries'

interface WhopProviderProps {
  children: ReactNode
  experienceId: string
  state: DehydratedState
}

export function WhopProvider({ children, experienceId, state }: WhopProviderProps) {
  const client = new QueryClient()

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={state}>
        <WhopProviderInner experienceId={experienceId}>{children}</WhopProviderInner>
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

interface WhopProviderInnerProps {
  children: ReactNode
  experienceId: string
}

function WhopProviderInner({ children, experienceId }: WhopProviderInnerProps) {
  const { data: experience } = useSuspenseQuery(whopExperienceQuery(experienceId))
  const {
    data: { user, access },
  } = useSuspenseQuery(whopUserQuery(experienceId))

  return (
    <WhopContext.Provider value={{ experience, user, access }}>{children}</WhopContext.Provider>
  )
}
