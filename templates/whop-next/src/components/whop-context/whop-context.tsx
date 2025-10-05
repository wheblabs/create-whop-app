'use client'

import type {
  CheckIfUserHasAccessToExperienceQuery,
  GetExperienceQuery,
  GetUserQuery,
} from '@whop/api'
import { createContext, useContext } from 'react'

export type WhopExperienceAccess = CheckIfUserHasAccessToExperienceQuery['hasAccessToExperience']
export type WhopExperience = GetExperienceQuery['experience']
export type WhopUser = GetUserQuery['publicUser']

/**
 * The context for the Whop API
 * @property experience - The experience
 * @property user - The user
 * @property access - Whether the user has access to the experience
 */
interface WhopContext {
  experience: WhopExperience
  user: WhopUser
  access: WhopExperienceAccess
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
