import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma, { orderBySlot } from '$lib/server/prisma'
import type { Prisma } from '@prisma/client'
import type { DepotTrainStartRequest } from 'grace-train-lib/trains'
import { endAllTrains, pickUserCar, transformCarFromDBToGraceTrainCar } from '../trains'

export const POST = (async ({ request }) => {
	console.log('/api/train/start POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) throw error(401)
	const { trainId, graces, score } = (await request.json()) as DepotTrainStartRequest
	endAllTrains(trainId)
	const users = await prisma.user.findMany({
		where: { twitchUserId: { in: graces.map((g) => g.userId) } },
		include: {
			cars: {
				include: { decals: orderBySlot, toppers: orderBySlot },
				where: { published: true },
			},
		},
	})
	// "Unchecked" is safe because we know the cars and users exist
	const graceTrainCars: Prisma.GraceTrainCarUncheckedCreateWithoutTrainInput[] = []
	graces.forEach((grace, i) => {
		const graceTrainCarCreate: Prisma.GraceTrainCarUncheckedCreateWithoutTrainInput = {
			index: i,
			twitchUserId: grace.userId,
			carData: grace.color,
		}
		const user = users.find((u) => u.twitchUserId === grace.userId)
		if (user && user.cars.length > 0) {
			const pickedCar = pickUserCar(
				user.cars,
				graceTrainCars.map((gtc) => ({
					carId: gtc.carId || null,
					userId: gtc.userId || null,
				}))
			)
			graceTrainCarCreate.carData = transformCarFromDBToGraceTrainCar(pickedCar)
			graceTrainCarCreate.carId = pickedCar.id
			graceTrainCarCreate.userId = user.id
		}
		graceTrainCars.push(graceTrainCarCreate)
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
