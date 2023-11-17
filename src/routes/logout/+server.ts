import { auth } from '$lib/server/lucia'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ url, cookies, locals }) => {
	const session = await locals.auth.validate()
	if (session) {
		locals.auth.setSession(null)
		auth.invalidateSession(session.sessionId)
		// TODO: Provide a link to log out of all sessions
		// auth.invalidateAllUserSessions(session.user.userId)
	}
	throw redirect(302, '/')
}) satisfies RequestHandler
