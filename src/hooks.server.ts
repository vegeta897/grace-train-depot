import { dev } from '$app/environment'
import { SKIP_AUTH } from '$env/static/private'
import { auth } from '$lib/server/lucia'
import prisma from '$lib/server/prisma'
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
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
	const is404 = event.route.id === null
	if (is404 && event.url.pathname.startsWith('/assets/car_')) {
		// Redirect deleted car image requests to "unknown" image
		throw redirect(302, '/car_unknown.png')
	}
}
