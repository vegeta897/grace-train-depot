import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma from '$lib/server/prisma'
import type { Prisma } from '@prisma/client'
import type { DepotTrainAddRequest, GraceTrainCar } from 'grace-train-lib/data'
import {
	incrementGraceTrainTotalAppearances,
	pickUserCar,
	updateGraceTrainCarStatsForTrain,
	userCarsIncludeQuery,
} from '../trains'
import { transformCarFromDBToDepotCar } from '$lib/server/car'

export const POST = (async ({ request }) => {
	console.log('/api/train/add POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) error(401)
	const { trainId, grace, index, score } = (await request.json()) as DepotTrainAddRequest
	let train
	try {
		train = await prisma.graceTrain.update({
			data: { score },
			include: { cars: true },
			where: { id: trainId },
		})
	} catch (e) {
		// Update throws if record not found
		error(400, 'Unknown train ID')
	}
	const user = await prisma.user.findUnique({
		where: {
			twitchUserId: grace.userId,
			trustLevel: { notIn: ['hidden', 'banned'] },
			cars: { some: {} }, // Only get users with at least one car
		},
		include: userCarsIncludeQuery,
	})
	const createGraceTrainCar: Prisma.GraceTrainCarUncheckedCreateInput = {
		trainId,
		index,
		twitchUserId: grace.userId,
		carData: { color: grace.color },
	}
	let graceTrainCar: GraceTrainCar = { color: grace.color }
	if (user) {
		const pickedCar = pickUserCar(user.cars, train.cars, train.signal)
		await incrementGraceTrainTotalAppearances(pickedCar.id)
		if (!train.cars.some((c) => c.carId === pickedCar.id)) {
			// Update train-specific stats if this is the first appearance in this train
			await updateGraceTrainCarStatsForTrain([pickedCar.id], trainId)
		}
		const pickedCarData = { depotCar: transformCarFromDBToDepotCar(pickedCar) }
		graceTrainCar = pickedCarData
		createGraceTrainCar.carData = pickedCarData
		createGraceTrainCar.carId = pickedCar.id
		createGraceTrainCar.carRevision = pickedCar.revision
		createGraceTrainCar.userId = user.id
		createGraceTrainCar.hasDecals = pickedCarData.depotCar.decals.length > 0
	}
	// Prisma queries need to be awaited to work properly
	// But we don't need to wait for this query to return the graceTrainCar response
	prisma.graceTrainCar.create({ data: createGraceTrainCar }).then()
	return json(graceTrainCar)
}) satisfies RequestHandler
