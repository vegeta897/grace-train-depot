import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma from '$lib/server/prisma'
import type { Prisma } from '@prisma/client'
import type { DepotTrainStartRequest, GraceTrainCar } from 'grace-train-lib/data'
import {
	incrementGraceTrainTotalAppearances,
	pickUserCar,
	updateGraceTrainCarStatsForTrain,
	userCarsIncludeQuery,
} from '../trains'
import { transformCarFromDBToDepotCar } from '$lib/server/car'
import { randomChance, randomElementWeighted } from '$lib/random'

const MIN_SIGNAL_USERS = 4
const RECENT_TRAIN_SPAN = 2 * 60 * 60 * 1000

export const POST = (async ({ request }) => {
	console.log('/api/train/start POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) error(401)
	const { trainId, graces, score } = (await request.json()) as DepotTrainStartRequest
	await prisma.graceTrain.updateMany({
		data: { ended: true },
		where: { ended: false, id: { not: trainId } },
	})
	// Get grace train users and their cars
	const users = await prisma.user.findMany({
		where: {
			twitchUserId: { in: graces.map((g) => g.userId) },
			trustLevel: { notIn: ['hidden', 'banned'] }, // No cars from hidden or banned users
			cars: { some: {} }, // Only get users with at least one car
		},
		include: userCarsIncludeQuery,
	})
	let signal: string | null = null
	if (users.length >= MIN_SIGNAL_USERS && randomChance(0.2)) {
		const mostRecentSignal =
			(
				await prisma.graceTrain.findFirst({
					where: {
						id: { gt: Date.now() - RECENT_TRAIN_SPAN },
						signal: { not: null },
					},
					orderBy: { id: 'desc' },
				})
			)?.signal || undefined
		signal = pickSignal(users, mostRecentSignal)
	}
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
			const pickedCar = pickUserCar(user.cars, pickedCars, signal)
			await incrementGraceTrainTotalAppearances(pickedCar.id)
			const pickedCarData = { depotCar: transformCarFromDBToDepotCar(pickedCar) }
			graceTrainCars.push(pickedCarData)
			pickedCars.push({ carId: pickedCar.id, userId: user.id })
			pickedCarIds.add(pickedCar.id)
			createGraceTrainCar.carData = pickedCarData
			createGraceTrainCar.carId = pickedCar.id
			createGraceTrainCar.carRevision = pickedCar.revision
			createGraceTrainCar.userId = user.id
			createGraceTrainCar.hasDecals = pickedCarData.depotCar.decals.length > 0
		} else {
			graceTrainCars.push({ color: grace.color })
		}
		createGraceTrainCars.push(createGraceTrainCar)
	}
	await updateGraceTrainCarStatsForTrain([...pickedCarIds], trainId)
	await prisma.graceTrain.create({
		data: { id: trainId, score, cars: { create: createGraceTrainCars }, signal },
	})
	return json(graceTrainCars)
}) satisfies RequestHandler

type UserAndCarData = Prisma.UserGetPayload<{
	include: typeof userCarsIncludeQuery
}>

// TODO: Track who is chatting in current stream and pick signal based on their cars
// in addition to the initial graces
function pickSignal(users: UserAndCarData[], except?: string) {
	const signalPool: Map<string, { users: Set<string> /*; cars: Set<number>*/ }> =
		new Map()
	for (const user of users) {
		for (const car of user.cars) {
			for (const signal of car.signals) {
				if (signal === except) continue
				const entry = signalPool.get(signal) || {
					users: new Set(),
					//cars: new Set(),
				}
				entry.users.add(user.id)
				//entry.cars.add(car.id)
				signalPool.set(signal, entry)
			}
		}
	}
	const signalOptions = [...signalPool.entries()]
		.map(([signal, stats]) => ({ signal, ...stats }))
		.filter((s) => s.users.size >= MIN_SIGNAL_USERS)
	const weights = signalOptions.map((s) => s.users.size)
	const signalChoice = randomElementWeighted(signalOptions, weights)
	return signalChoice.signal
}
