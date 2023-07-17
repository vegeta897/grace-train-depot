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
		// TODO: Add user tokens to twurple auth provider
		// We can use this to check if user is following/subscribed
		// api.channels.getFollowedChannels(user, broadcaster)
		// api.subscriptions.checkUserSubscription(user, broadcaster)
		const getUser = async () => {
			if (existingUser) return existingUser
			const user = await createUser({
				attributes: {
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
	throw redirect(302, '/')
}) satisfies RequestHandler
