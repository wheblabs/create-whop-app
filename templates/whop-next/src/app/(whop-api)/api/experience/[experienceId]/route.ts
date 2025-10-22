import { NextRequest, NextResponse } from 'next/server'
import { WhopExperience, whop } from '~/lib/whop'

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ experienceId: string }> },
) {
	const { experienceId } = await params
	if (!experienceId)
		return NextResponse.json({ error: 'Missing params' }, { status: 400 })

	try {
		const experience = await whop.experiences.getExperience({ experienceId })
		return NextResponse.json<WhopExperience>(experience)
	} catch (error) {
		console.error('Failed to fetch experience:', error)
		return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
	}
}
