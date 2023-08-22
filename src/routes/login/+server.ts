import { dev } from '$app/environment'
import { twitchAuth } from '$lib/server/lucia.js'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ cookies, locals, url }) => {
	const redirectTo = url.searchParams.get('redirectTo')
	const session = await locals.auth.validate()
	if (session) throw redirect(302, redirectTo || '/')
	const [authUrl, state] = await twitchAuth.getAuthorizationUrl()
	cookies.set('twitch_oauth_state', state, {
		httpOnly: true,
		secure: !dev,
		path: '/',
		maxAge: 60 * 60,
	})
	if (redirectTo) {
		cookies.set('twitch_oauth_redirect_to', redirectTo, {
			httpOnly: true,
			secure: !dev,
			path: '/',
			maxAge: 60 * 60,
		})
	}
	throw redirect(302, authUrl.toString())
}) satisfies RequestHandler
