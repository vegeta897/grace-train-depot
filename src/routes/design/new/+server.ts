import prisma from '$lib/server/prisma'
import { generateRandomString } from 'lucia/utils'
import { redirect, type RequestHandler } from '@sveltejs/kit'
import { COLORS } from 'grace-train-lib'

// Length of 6 = 33k IDs before 1% chance of collision
// https://zelark.github.io/nano-id-cc/
const shortIdAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const shortIdLength = 6

export const GET = (async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw redirect(302, '/')
	// TODO: Check if user has reached cars limit
	const shortId = generateRandomString(shortIdLength, shortIdAlphabet)
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
