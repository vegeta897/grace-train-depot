import { dev } from '$app/environment'
import { twitchAuth } from '$lib/server/lucia.js'
import { redirect, type RequestHandler } from '@sveltejs/kit'
import { generateState } from 'arctic'

export const GET = (async ({ cookies, locals, url }) => {
	const redirectTo = url.searchParams.get('redirectTo')
	if (locals.user) redirect(302, redirectTo || '/')
	const state = generateState()
	const authUrl = await twitchAuth.createAuthorizationURL(state)
	cookies.set('twitch_oauth_state', state, {
		secure: !dev,
		path: '/',
		maxAge: 60 * 60,
	})
	if (redirectTo) {
		cookies.set('twitch_oauth_redirect_to', redirectTo, {
			secure: !dev,
			path: '/',
			maxAge: 60 * 60,
		})
	} else {
		cookies.delete('twitch_oauth_redirect_to', { path: '/' })
	}
	redirect(302, authUrl.toString())
}) satisfies RequestHandler
