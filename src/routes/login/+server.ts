import { dev } from '$app/environment'
import { twitchAuth } from '$lib/server/lucia.js'
import type { RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ cookies, locals }) => {
	const session = await locals.auth.validate()
	if (session) {
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		})
	}
	const [url, state] = await twitchAuth.getAuthorizationUrl()
	cookies.set('twitch_oauth_state', state, {
		httpOnly: true,
		secure: !dev,
		path: '/',
		maxAge: 60 * 60,
	})
	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	})
}) satisfies RequestHandler
