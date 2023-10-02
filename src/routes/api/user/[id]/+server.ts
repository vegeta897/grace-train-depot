import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma from '$lib/server/prisma'
import type { CarData } from '$lib/server/schemas'
import type { GraceTrainCar } from 'grace-train-lib/trains'
import { transformCarFromDB } from '$lib/car'

export const GET = (async ({ request, params }) => {
	console.log('/api/car GET received!', params.id)
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) throw error(401)
	const userWithCars = await prisma.user.findUnique({
		where: { twitchUserId: params.id },
		include: { cars: { include: { decals: true, toppers: true } } },
	})
	if (!userWithCars) throw error(404, 'User not found')
	return json({
		userId: userWithCars.id,
		cars: userWithCars.cars.map((c) => transformCarToWS(transformCarFromDB(c))),
	})
}) satisfies RequestHandler

function transformCarToWS(car: CarData): GraceTrainCar {
	return {
		body: car.body,
		bodyColor: car.bodyColor,
		bodyPopColor: car.bodyPopColor,
		wheelColor: car.wheels.color,
		wheelFromCenter: car.wheels.fromCenter,
		decals: car.decals.map((d) => ({
			name: d.name,
			fill: d.fill,
			...d.transform,
			params: d.params,
		})),
		toppers: car.toppers.map((t) => ({
			name: t.name,
			colors: t.colors,
			position: t.position,
			offset: t.offset,
			scale: t.scale,
			rotate: t.rotate,
		})),
	}
}
