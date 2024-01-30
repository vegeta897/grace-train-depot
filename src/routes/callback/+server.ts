import { userIsTrusted } from '$lib/server/admin'
import { auth, twitchAuth } from '$lib/server/lucia.js'
import { OAuthRequestError } from '@lucia-auth/oauth'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ url, cookies, locals }) => {
	const redirectToCookie = cookies.get('twitch_oauth_redirect_to')
	cookies.delete('twitch_oauth_redirect_to', { path: '/' })
	const session = await locals.auth.validate()
	if (session) redirect(302, redirectToCookie || '/')
	const storedState = cookies.get('twitch_oauth_state')
	const state = url.searchParams.get('state')
	const code = url.searchParams.get('code')
	if (!storedState || !state || storedState !== state || !code) {
		throw new Response(null, { status: 401 })
	}
	let newUser = false
	try {
		const { getExistingUser, twitchUser, createUser, twitchTokens } =
			await twitchAuth.validateCallback(code)
		const existingUser = await getExistingUser()
		// TODO: Call spice bot endpoint to see if user is following/subscribed
		// TODO: Check if twitch user id is in BannedUsers table
		const getUser = async () => {
			if (existingUser) return existingUser
			newUser = true
			const user = await createUser({
				attributes: {
					// Maybe add createdAt as an attribute, pass in new Date() since lucia doesn't handle defaults
					twitchUserId: twitchUser.id,
					twitchUsername: twitchUser.login,
					twitchDisplayName: twitchUser.display_name,
					trustLevel: userIsTrusted(twitchUser.id) ? 'trusted' : 'default',
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
	// Redirect new users to new car design page
	const redirectTo = redirectToCookie || (newUser ? '/design/new' : '/')
	redirect(302, redirectTo)
}) satisfies RequestHandler
