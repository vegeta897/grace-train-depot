import { TWITCH_CLIENT_ID } from '$env/static/private'
import { userIsTrusted } from '$lib/server/admin'
import { lucia, twitchAuth } from '$lib/server/lucia.js'
import prisma from '$lib/server/prisma'
import { redirect, type RequestHandler } from '@sveltejs/kit'
import { OAuth2RequestError } from 'arctic'
import { generateId } from 'lucia'

export const GET = (async ({ url, cookies, locals }) => {
	const redirectToCookie = cookies.get('twitch_oauth_redirect_to')
	cookies.delete('twitch_oauth_redirect_to', { path: '/' })
	if (locals.user) redirect(302, redirectToCookie || '/')
	const storedState = cookies.get('twitch_oauth_state')
	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')
	if (!code || !state || !storedState || storedState !== state) {
		throw new Response(null, { status: 400 })
	}
	let newUser = false
	try {
		const twitchTokens = await twitchAuth.validateAuthorizationCode(code)
		const twitchUserResponse = await fetch('https://api.twitch.tv/helix/users', {
			headers: {
				'Client-ID': TWITCH_CLIENT_ID,
				Authorization: `Bearer ${twitchTokens.accessToken}`,
			},
		})
		const twitchUser: TwitchUser = (await twitchUserResponse.json()).data[0]
		// TODO: Call spice bot endpoint to see if user is following/subscribed
		// TODO: Check if twitch user id is in BannedUsers table
		const existingUser = await prisma.user.findUnique({
			where: { twitchUserId: twitchUser.id },
		})
		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes,
			})
		} else {
			const userId = generateId(15)
			await prisma.user.create({
				data: {
					id: userId,
					twitchUserId: twitchUser.id,
					twitchUsername: twitchUser.login,
					twitchDisplayName: twitchUser.display_name,
					trustLevel: userIsTrusted(twitchUser.id) ? 'trusted' : 'default',
				},
			})
			const session = await lucia.createSession(userId, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '/',
				...sessionCookie.attributes,
			})
			newUser = true
		}
		// Redirect new users to new car design page
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, { status: 400 })
		}
		return new Response(null, { status: 500 })
	}
	const redirectTo = redirectToCookie || (newUser ? '/design/new' : '/')
	redirect(302, redirectTo)
}) satisfies RequestHandler

interface TwitchUser {
	id: string
	login: string
	display_name: string
}
