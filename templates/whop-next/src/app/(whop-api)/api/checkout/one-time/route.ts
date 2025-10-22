import { verifyUserToken } from '@whop/api'
import { NextRequest, NextResponse } from 'next/server'
import { env } from '~/env'
import { whop } from '~/lib/whop'

export async function POST(req: NextRequest) {
	const { userId } = await verifyUserToken(req.headers)
	if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	try {
		const checkoutSession = await whop.payments.createCheckoutSession({
			planId: env.ONE_TIME_PURCHASE_ACCESS_PASS_PLAN_ID,
		})

		if (!checkoutSession)
			return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })

		return NextResponse.json({
			planId: env.ONE_TIME_PURCHASE_ACCESS_PASS_PLAN_ID,
			checkoutId: checkoutSession.id,
		})
	} catch (error) {
		console.error('Failed to create checkout session:', error)
		return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
	}
}
