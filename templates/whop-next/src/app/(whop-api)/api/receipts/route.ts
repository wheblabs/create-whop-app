import { verifyUserToken } from '@whop/api'
import { NextRequest, NextResponse } from 'next/server'
import { env } from '~/env'
import { whop } from '~/lib/whop'

export async function GET(req: NextRequest) {
	const { userId } = await verifyUserToken(req.headers)
	if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	try {
		const receipts = await whop.payments.listReceiptsForCompany({
			companyId: env.NEXT_PUBLIC_WHOP_COMPANY_ID,
			filter: {
				accessPassIds: [
					env.ONE_TIME_PURCHASE_ACCESS_PASS_ID,
					env.SUBSCRIPTION_PURCHASE_ACCESS_PASS_ID,
				],
				statuses: ['succeeded'],
			},
		})

		const nodes = receipts?.receipts?.nodes ?? []

		// Filter receipts to only include the current user's purchases
		const userReceipts = nodes.filter((r: any) => r?.member?.user?.id === userId)

		// Transform and group receipts by access pass
		const oneTimeReceipts = userReceipts
			.filter((r: any) => {
				return (
					r?.accessPass?.id === env.ONE_TIME_PURCHASE_ACCESS_PASS_ID &&
					typeof r.finalAmount === 'number' &&
					typeof r.paidAt === 'number'
				)
			})
			.map((r: any) => {
				if (!r || typeof r.paidAt !== 'number') {
					throw new Error('Invalid receipt data')
				}
				return {
					amountPaid: r.finalAmount,
					paidAt: new Date(r.paidAt * 1000).toISOString(),
				}
			})

		const members = await whop.companies.listMembers({
			companyId: env.NEXT_PUBLIC_WHOP_COMPANY_ID,
			filters: {
				accessPassIds: [env.SUBSCRIPTION_PURCHASE_ACCESS_PASS_ID],
			},
		})

		const subscriptionReceipts = userReceipts
			.filter((r: any) => {
				return (
					r?.accessPass?.id === env.SUBSCRIPTION_PURCHASE_ACCESS_PASS_ID &&
					typeof r.finalAmount === 'number' &&
					typeof r.paidAt === 'number'
				)
			})
			.map((r: any) => {
				if (!r || typeof r.paidAt !== 'number') {
					throw new Error('Invalid receipt data')
				}
				return {
					amountPaid: r.finalAmount,
					paidAt: new Date(r.paidAt * 1000).toISOString(),
					subscriptionStatus: r.membership?.status ?? null,
					membershipId: r.membership?.id ?? null,
					member:
						members?.members?.nodes?.find((m: any) => m?.user?.id === r.member?.user?.id) ?? null,
				}
			})

		console.log(subscriptionReceipts)

		return NextResponse.json({
			accessPasses: [
				{
					id: env.ONE_TIME_PURCHASE_ACCESS_PASS_ID,
					type: 'one-time',
					receipts: oneTimeReceipts,
				},
				{
					id: env.SUBSCRIPTION_PURCHASE_ACCESS_PASS_ID,
					type: 'subscription',
					receipts: subscriptionReceipts,
				},
			],
		})
	} catch (error) {
		console.error('Failed to fetch receipts:', error)
		return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 })
	}
}
