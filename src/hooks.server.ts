import { dev } from '$app/environment'
import { SKIP_AUTH } from '$env/static/private'
import { lucia } from '$lib/server/lucia'
import prisma from '$lib/server/prisma'
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit'

// Regex for user agents from popular embed scrapers
const botRegex = /((apple|discord|twitter|slack|telegram)bot|facebookexternalhit)/gi

export const handle: Handle = async ({ event, resolve }) => {
	let sessionId = event.cookies.get(lucia.sessionCookieName)
	if (dev && SKIP_AUTH === 'true') {
		console.log('(skipping auth)', event.url.pathname)
		const userWithSessions = await prisma.user.findUniqueOrThrow({
			include: { sessions: true },
			where: { twitchUsername: 'vegeta897' },
		})
		const session = userWithSessions.sessions[0]
		if (session) sessionId = session.id
	}
	if (!sessionId) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}
	const { session, user } = await lucia.validateSession(sessionId)
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id)
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes,
		})
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie()
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes,
		})
	}
	event.locals.user = user
	event.locals.session = session
	event.locals.botAgent = botRegex.test(event.request.headers.get('user-agent') ?? '')
	return resolve(event)
}

export const handleError: HandleServerError = async ({ error, event }) => {
	console.log(error)
	const is404 = event.route.id === null
	if (is404 && event.url.pathname.startsWith('/assets/car_')) {
		// Redirect deleted car image requests to "unknown" image
		redirect(302, '/car_unknown.png')
	}
}
