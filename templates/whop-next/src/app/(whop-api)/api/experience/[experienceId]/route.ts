import Shared from '@whop/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { whop } from '~/lib/whop'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> },
) {
  const { experienceId } = await params
  if (!experienceId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  try {
    const experience = await whop.experiences.retrieve(experienceId)
    return NextResponse.json<Shared.Experience>(experience)
  } catch (error) {
    console.error('Failed to fetch experience:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
