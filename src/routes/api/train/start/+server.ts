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

// TODO: Themed trains shoot out something besides smoke

const MIN_THEME_USERS = 4
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
	let theme: string | null = null
	if (users.length >= MIN_THEME_USERS && randomChance(0.2)) {
		const mostRecentTheme =
			(
				await prisma.graceTrain.findFirst({
					where: {
						id: { gt: Date.now() - RECENT_TRAIN_SPAN },
						theme: { not: null },
					},
					orderBy: { id: 'desc' },
				})
			)?.theme || undefined
		theme = pickTheme(users, mostRecentTheme)
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
			const pickedCar = pickUserCar(user.cars, pickedCars, theme)
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
		data: { id: trainId, score, cars: { create: createGraceTrainCars }, theme },
	})
	return json(graceTrainCars)
}) satisfies RequestHandler

type UserAndCarData = Prisma.UserGetPayload<{
	include: typeof userCarsIncludeQuery
}>

// TODO: Track who is chatting in current stream and pick theme based on their cars
// in addition to the initial graces
function pickTheme(users: UserAndCarData[], except?: string) {
	const themePool: Map<string, { users: Set<string> /*; cars: Set<number>*/ }> = new Map()
	for (const user of users) {
		for (const car of user.cars) {
			for (const theme of car.themes) {
				if (theme === except) continue
				const entry = themePool.get(theme) || {
					users: new Set(),
					//cars: new Set(),
				}
				entry.users.add(user.id)
				//entry.cars.add(car.id)
				themePool.set(theme, entry)
			}
		}
	}
	const themeOptions = [...themePool.entries()]
		.map(([theme, stats]) => ({ theme, ...stats }))
		.filter((s) => s.users.size >= MIN_THEME_USERS)
	const weights = themeOptions.map((s) => s.users.size)
	const themeChoice = randomElementWeighted(themeOptions, weights)
	return themeChoice.theme
}
