import { dev } from '$app/environment'
import { SKIP_AUTH } from '$env/static/private'
import { auth } from '$lib/server/lucia'
import prisma from '$lib/server/prisma'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event)
	if (dev && SKIP_AUTH === 'true') {
		console.log('skipping auth')
		const sessionRecord = await prisma.session.findFirstOrThrow()
		const luciaSession = await auth.getSession(sessionRecord.id)
		event.locals.auth.setSession(luciaSession)
	}
	return await resolve(event)
}
