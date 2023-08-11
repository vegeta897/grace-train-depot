import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma from '$lib/server/prisma'

export const GET = (async ({ request, params }) => {
	console.log('/api/car GET received!', params.id)
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) throw error(401)
	const userWithCars = await prisma.user.findUnique({
		where: { twitchUserId: params.id },
		include: { cars: { include: { decals: true } } },
	})
	if (!userWithCars) throw error(404, 'User not found')
	// TODO: Return only essential properties
	// Maybe return a type defined in grace-train-lib so spice bot knows what to expect
	return json(userWithCars)
}) satisfies RequestHandler
