export interface Env {
	ASSETS: R2Bucket
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		// Always serve index.html for any request
		const object = await env.ASSETS.get('index.html')

		if (!object) {
			return new Response('File not found', { status: 404 })
		}

		const headers = new Headers()
		headers.set('Content-Type', 'text/html')
		headers.set('Cache-Control', 'public, max-age=3600')

		// Add CORS headers if needed
		headers.set('Access-Control-Allow-Origin', '*')

		return new Response(object.body, {
			headers,
		})
	},
}
