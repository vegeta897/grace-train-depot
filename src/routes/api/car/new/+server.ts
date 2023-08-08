import { generateCarShortId } from '$lib/car'
import prisma from '$lib/server/prisma'
import { redirect, type RequestHandler } from '@sveltejs/kit'
import { COLORS } from 'grace-train-lib'

export const GET = (async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(302, '/')
	// TODO: Check if user has reached cars limit
	const shortId = generateCarShortId()
	await prisma.car.create({
		data: {
			shortId,
			wheelColor: COLORS.POP,
			wheelFromCenter: 100,
			user: {
				connect: {
					id: session.user.userId,
				},
			},
		},
	})
	throw redirect(302, `/design/${shortId}`)
}) satisfies RequestHandler
