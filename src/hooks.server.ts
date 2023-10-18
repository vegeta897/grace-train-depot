import { dev } from '$app/environment'
import { SKIP_AUTH } from '$env/static/private'
import { auth } from '$lib/server/lucia'
import prisma from '$lib/server/prisma'
import { redirect, type Handle, type HandleServerError, error } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	const forbidden =
		event.request.method === 'POST' &&
		event.request.headers.get('origin') !== event.url.origin &&
		!event.url.pathname.startsWith('/api/train/')
	if (forbidden) {
		throw error(403, 'Cross-site POST requests are forbidden')
	}
	event.locals.auth = auth.handleRequest(event)
	if (dev && SKIP_AUTH === 'true') {
		console.log('skipping auth')
		const sessionRecord = await prisma.session.findFirstOrThrow()
		const luciaSession = await auth.getSession(sessionRecord.id)
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
