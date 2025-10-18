import { NextRequest, NextResponse } from 'next/server'
import { whop } from '~/lib/whop'
import Shared from '@whop/sdk'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> },
) {
  const { experienceId } = await params
  if (!experienceId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const { userId } = await whop.verifyUserToken(req.headers)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const [user, access] = await Promise.all([
      whop.users.retrieve(userId),
      whop.users.checkAccess(experienceId, { id: userId }),
    ])
    return NextResponse.json<{
      user: Shared.UserRetrieveResponse
      access: Shared.UserCheckAccessResponse
    }>({ user, access })
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
