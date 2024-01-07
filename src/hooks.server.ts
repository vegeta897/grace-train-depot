import { dev } from '$app/environment'
import { SKIP_AUTH } from '$env/static/private'
import { auth } from '$lib/server/lucia'
import prisma from '$lib/server/prisma'
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit'

// Regex for user agents from popular embed scrapers
const botRegex = /(apple|discord|twitter|slack|telegram)bot/gi

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event)
	event.locals.botAgent = botRegex.test(event.request.headers.get('user-agent') ?? '')
	if (dev && SKIP_AUTH === 'true') {
		console.log('skipping auth')
		const userWithSessions = await prisma.user.findUniqueOrThrow({
			include: { auth_session: true },
			where: { twitchUsername: 'vegeta897' },
		})
		const session = userWithSessions.auth_session[0]
		const luciaSession = await auth.getSession(session.id)
		event.locals.auth.setSession(luciaSession)
	}
	const response = await resolve(event)
	return response
}

export const handleError: HandleServerError = async ({ error, event }) => {
	console.log(error)
	const is404 = event.route.id === null
	if (is404 && event.url.pathname.startsWith('/assets/car_')) {
		// Redirect deleted car image requests to "unknown" image
		throw redirect(302, '/car_unknown.png')
	}
}
