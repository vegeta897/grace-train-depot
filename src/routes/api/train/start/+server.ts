import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma, { orderBySlot } from '$lib/server/prisma'
import type { Prisma } from '@prisma/client'
import type { DepotTrainStartRequest } from 'grace-train-lib/trains'
import {
	endAllTrains,
	incrementGraceTrainTotalAppearances,
	pickUserCar,
	transformCarFromDBToGraceTrainCar,
	updateGraceTrainCarStatsForTrain,
} from '../trains'

export const POST = (async ({ request }) => {
	console.log('/api/train/start POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) throw error(401)
	console.time('train start')
	const { trainId, graces, score } = (await request.json()) as DepotTrainStartRequest
	endAllTrains(trainId)
	// Get all users and their cars
	const users = await prisma.user.findMany({
		where: {
			twitchUserId: { in: graces.map((g) => g.userId) },
			trustLevel: { not: 'flagged' }, // No cars from flagged users
		},
		include: {
			cars: {
				include: { decals: orderBySlot, toppers: orderBySlot },
				where: { published: true },
			},
		},
	})
	// "Unchecked" is safe because we know the cars and users exist
	const graceTrainCars: Prisma.GraceTrainCarUncheckedCreateWithoutTrainInput[] = []
	const pickedCarIds: Set<number> = new Set()
	for (let i = 0; i < graces.length; i++) {
		const grace = graces[i]
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
			await incrementGraceTrainTotalAppearances(pickedCar.id)
			pickedCarIds.add(pickedCar.id)
			graceTrainCarCreate.carData = transformCarFromDBToGraceTrainCar(pickedCar)
			graceTrainCarCreate.carId = pickedCar.id
			graceTrainCarCreate.carRevision = pickedCar.revision
			graceTrainCarCreate.approval = pickedCar.approval
			graceTrainCarCreate.userId = user.id
		}
		graceTrainCars.push(graceTrainCarCreate)
	}
	await updateGraceTrainCarStatsForTrain([...pickedCarIds], trainId)
	await prisma.graceTrain.create({
		data: {
			id: trainId,
			score,
			cars: {
				create: graceTrainCars,
			},
		},
	})
	console.timeEnd('train start')
	return json(graceTrainCars.map((gtc) => gtc.carData))
}) satisfies RequestHandler
