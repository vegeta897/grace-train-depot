import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma, { orderBySlot } from '$lib/server/prisma'
import { transformCarFromDBToGraceTrainCar } from '$lib/car'
import type { Prisma } from '@prisma/client'
import type { DepotTrainStartRequest } from 'grace-train-lib/trains'

export const POST = (async ({ request }) => {
	console.log('/api/train/start POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) throw error(401)
	const { trainId, graces, score } = (await request.json()) as DepotTrainStartRequest
	const users = await prisma.user.findMany({
		where: { twitchUserId: { in: graces.map((g) => g.userId) } },
		include: {
			cars: { include: { decals: orderBySlot, toppers: orderBySlot } },
		},
	})
	const graceTrainCars = graces.map((grace, i) => {
		const graceTrainCarCreate: Prisma.GraceTrainCarCreateWithoutTrainInput = {
			index: i,
			twitchUserId: grace.userId,
			carData: grace.color,
		}
		const user = users.find((u) => u.twitchUserId === grace.userId)
		if (user && user.cars.length > 0) {
			graceTrainCarCreate.user = { connect: { id: user.id } }
			// TODO: Car picking logic
			graceTrainCarCreate.carData = transformCarFromDBToGraceTrainCar(user.cars[0])
		}
		return graceTrainCarCreate
	})
	await prisma.graceTrain.create({
		data: {
			id: trainId,
			score,
			cars: {
				create: graceTrainCars,
			},
		},
	})

	return json(graceTrainCars.map((gtc) => gtc.carData))
}) satisfies RequestHandler
