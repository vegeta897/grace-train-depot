import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma, { orderBySlot } from '$lib/server/prisma'
import type { Prisma } from '@prisma/client'
import type { DepotTrainAddRequest } from 'grace-train-lib/trains'
import {
	incrementGraceTrainTotalAppearances,
	pickUserCar,
	transformCarFromDBToGraceTrainCar,
	updateGraceTrainCarStatsForTrain,
} from '../trains'

export const POST = (async ({ request }) => {
	console.log('/api/train/add POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) throw error(401)
	const { trainId, grace, index, score } = (await request.json()) as DepotTrainAddRequest
	const train = await prisma.graceTrain.update({
		data: { score },
		include: { cars: true },
		where: { id: trainId },
	})
	if (!train) throw error(400, 'Unknown train ID')
	const graceTrainCarCreate: Prisma.GraceTrainCarUncheckedCreateInput = {
		trainId,
		index,
		twitchUserId: grace.userId,
		carData: grace.color,
	}
	const user = await prisma.user.findUnique({
		where: { twitchUserId: grace.userId },
		include: {
			cars: {
				include: { decals: orderBySlot, toppers: orderBySlot },
				where: { published: true },
			},
		},
	})
	if (user && user.cars.length > 0) {
		const pickedCar = pickUserCar(user.cars, train.cars)
		await incrementGraceTrainTotalAppearances(pickedCar.id)
		if (train.cars.some((c) => c.carId === pickedCar.id)) {
			// Update train-specific stats if this is the first appearance in this train
			await updateGraceTrainCarStatsForTrain([pickedCar.id], trainId)
		}
		graceTrainCarCreate.carData = transformCarFromDBToGraceTrainCar(pickedCar)
		graceTrainCarCreate.carId = pickedCar.id
		graceTrainCarCreate.userId = user.id
	}
	prisma.graceTrainCar
		.create({
			data: graceTrainCarCreate,
		})
		.then() // Prisma queries need to be awaited to work properly
	return json(graceTrainCarCreate.carData)
}) satisfies RequestHandler
