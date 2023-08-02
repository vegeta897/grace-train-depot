import prisma from '$lib/server/prisma'
import type { Car } from '$lib/types'
import { error, json, type RequestHandler } from '@sveltejs/kit'

// TODO: If request/response typing gets hard to manage, consider tRPC-SvelteKit
// https://icflorescu.github.io/trpc-sveltekit

// TODO: Maybe check for props on incoming Partial<Car> to update

export const PUT = (async ({ request, locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw error(401, 'You are not logged in')
	const reqJson: { carId: number; carData: Car } = await request.json()
	console.log('/api/car PUT received for car ID', reqJson.carId)
	const { carId, carData } = reqJson
	const dbCar = await prisma.car.findUnique({ where: { id: carId } })
	if (!dbCar) throw error(404, 'Unknown car')
	if (dbCar.userId !== session.user.userId) throw error(403, "That's not your car!")
	await prisma.car.update({
		where: { id: carId },
		data: {
			body: carData.body,
			hatColor: carData.hat.color,
			wheelColor: carData.wheels.color,
			wheelFromCenter: carData.wheels.fromCenter,
		},
	})
	return json('success')
}) satisfies RequestHandler
