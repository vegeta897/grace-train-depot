import { dev } from '$app/environment'
import { twitchAuth } from '$lib/server/lucia.js'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ cookies, locals }) => {
	const session = await locals.auth.validate()
	if (session) throw redirect(302, '/')
	const [url, state] = await twitchAuth.getAuthorizationUrl()
	cookies.set('twitch_oauth_state', state, {
		httpOnly: true,
		secure: !dev,
		path: '/',
		maxAge: 60 * 60,
	})
	throw redirect(302, url.toString())
}) satisfies RequestHandler
