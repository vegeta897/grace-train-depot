import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma from '$lib/server/prisma'
import type { Prisma } from '@prisma/client'
import type { DepotTrainStartRequest, GraceTrainCar } from 'grace-train-lib/trains'
import {
	endAllTrains,
	incrementGraceTrainTotalAppearances,
	pickUserCar,
	transformCarFromDBToGraceTrainCar,
	updateGraceTrainCarStatsForTrain,
	userCarsIncludeQuery,
} from '../trains'

export const POST = (async ({ request }) => {
	console.log('/api/train/start POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) error(401)
	const { trainId, graces, score } = (await request.json()) as DepotTrainStartRequest
	await endAllTrains(trainId)
	// Get grace train users and their cars
	const users = await prisma.user.findMany({
		where: {
			twitchUserId: { in: graces.map((g) => g.userId) },
			trustLevel: { notIn: ['hidden', 'banned'] }, // No cars from hidden or banned users
			cars: { some: {} }, // Only get users with at least one car
		},
		include: userCarsIncludeQuery,
	})
	const graceTrainCars: GraceTrainCar[] = []
	const createGraceTrainCars: Prisma.GraceTrainCarUncheckedCreateWithoutTrainInput[] = []
	const pickedCars: Parameters<typeof pickUserCar>[1] = []
	const pickedCarIds: Set<number> = new Set()
	for (let i = 0; i < graces.length; i++) {
		const grace = graces[i]
		const createGraceTrainCar: Prisma.GraceTrainCarUncheckedCreateWithoutTrainInput = {
			index: i,
			twitchUserId: grace.userId,
			carData: { color: grace.color },
		}
		const user = users.find((u) => u.twitchUserId === grace.userId)
		if (user) {
			const pickedCar = pickUserCar(user.cars, pickedCars)
			await incrementGraceTrainTotalAppearances(pickedCar.id)
			const pickedCarData = { depotCar: transformCarFromDBToGraceTrainCar(pickedCar) }
			graceTrainCars.push(pickedCarData)
			pickedCars.push({ carId: pickedCar.id, userId: user.id })
			pickedCarIds.add(pickedCar.id)
			createGraceTrainCar.carData = pickedCarData
			createGraceTrainCar.carId = pickedCar.id
			createGraceTrainCar.carRevision = pickedCar.revision
			createGraceTrainCar.userId = user.id
		} else {
			graceTrainCars.push({ color: grace.color })
		}
		createGraceTrainCars.push(createGraceTrainCar)
	}
	await updateGraceTrainCarStatsForTrain([...pickedCarIds], trainId)
	await prisma.graceTrain.create({
		data: { id: trainId, score, cars: { create: createGraceTrainCars } },
	})
	return json(graceTrainCars)
}) satisfies RequestHandler
