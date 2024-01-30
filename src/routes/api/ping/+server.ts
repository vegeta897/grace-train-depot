import { DEPOT_SECRET } from '$env/static/private'
import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET = (async ({ request }) => {
	console.log('/api/ping GET received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) error(401)
	return new Response('pong!')
}) satisfies RequestHandler
