'use client'

import Shared from '@whop/sdk'
import { createContext, useContext } from 'react'

/**
 * The context for the Whop API
 * @property experience - The experience
 * @property user - The user
 * @property access - Whether the user has access to the experience
 */
interface WhopContext {
  experience: Shared.Experience
  user: Shared.UserRetrieveResponse
  access: Shared.UserCheckAccessResponse
}

export const WhopContext = createContext<WhopContext | null>(null)

/**
 * Hook to use the Whop context
 *
 * @example
 * const { experience, user, access } = useWhop()
 * return (
 *   <div>
 *     <h1>{experience.name}</h1>
 *     <p>{user.name}</p>
 *     <p>{access.accessLevel}</p>
 *   </div>
 * )
 */
export function useWhop(): WhopContext {
  const context = useContext(WhopContext)
  if (!context) throw new Error('useWhop must be used within a WhopProvider')
  return context
}
