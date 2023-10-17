import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma from '$lib/server/prisma'
import type { CarData } from '$lib/server/schemas'
import type { GraceTrainCar } from 'grace-train-lib/trains'
import { transformCarFromDB } from '$lib/car'

// TODO: Create /train/start /train/add and /train/end endpoints
// Depot will track current train based on its ID and pick cars accordingly
// This makes it easier to work with users, cars, lines, etc
// Also makes it easy to track stats like how many trains a car has been in, etc

export const GET = (async ({ request, params }) => {
	console.log('/api/users GET received!', params.ids)
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) throw error(401)
	const userIDs: string[] = params.ids.split(',')
	const usersWithCars = await prisma.user.findMany({
		where: { twitchUserId: { in: userIDs } },
		include: { cars: { include: { decals: true, toppers: true } } },
	})
	const unknownUserIds = userIDs.filter(
		(id) => !usersWithCars.some((u) => u.twitchUserId === id)
	)
	return json({
		users: usersWithCars.map((u) => ({
			userId: u.id,
			cars: u.cars.map((c) => transformCarToWS(transformCarFromDB(c))),
		})),
		unknownUserIds: unknownUserIds.length > 0 ? unknownUserIds : undefined,
	})
}) satisfies RequestHandler

function transformCarToWS(car: CarData): GraceTrainCar {
	return {
		body: car.body,
		bodyColor: car.bodyColor,
		bodyPopColor: car.bodyPopColor,
		wheelColor: car.wheelColor,
		wheelFromCenter: car.wheelFromCenter,
		decals: car.decals.map((d) => ({
			name: d.name,
			fill: d.fill,
			x: d.x,
			y: d.y,
			scale: d.scale,
			rotate: d.rotate,
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
