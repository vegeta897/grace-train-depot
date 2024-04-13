import { lucia } from '$lib/server/lucia'
import { redirect, type RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ cookies, locals }) => {
	if (locals.session) {
		await lucia.invalidateSession(locals.session.id)
		const sessionCookie = lucia.createBlankSessionCookie()
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes,
		})
		// TODO: Provide a link to log out of all sessions
		// lucia.invalidateUserSessions(locals.user.id)
	}
	redirect(302, '/')
}) satisfies RequestHandler
