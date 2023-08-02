import { auth, twitchAuth } from '$lib/server/lucia.js'
import { OAuthRequestError } from '@lucia-auth/oauth'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ url, cookies, locals }) => {
	const session = await locals.auth.validate()
	if (session) throw redirect(302, '/')
	const storedState = cookies.get('twitch_oauth_state')
	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')
	if (!storedState || !state || storedState !== state || !code) {
		throw new Response(null, { status: 401 })
	}
	try {
		const { existingUser, twitchUser, createUser, twitchTokens } =
			await twitchAuth.validateCallback(code)
		// TODO: Call spice bot endpoint to see if user is following/subscribed
		const getUser = async () => {
			if (existingUser) return existingUser
			const user = await createUser({
				attributes: {
					// Maybe add createdAt as an attribute, pass in new Date() since lucia doesn't handle defaults
					twitchUserId: twitchUser.id,
					twitchUsername: twitchUser.login,
					twitchDisplayName: twitchUser.display_name,
				},
			})
			return user
		}
		const user = await getUser()
		const session = await auth.createSession({ userId: user.userId, attributes: {} })
		locals.auth.setSession(session)
	} catch (e) {
		if (e instanceof OAuthRequestError) {
			// invalid code
			return new Response(null, {
				status: 400,
			})
		}
		return new Response(null, {
			status: 500,
		})
	}
	// TODO: Implement a redirectTo search param to take the user to the page they were
	// trying to reach: https://www.youtube.com/watch?v=ieECVME5ZLU
	throw redirect(302, '/')
}) satisfies RequestHandler
