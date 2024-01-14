import { DEPOT_SECRET, SPICE_BOT_HOSTNAME, SPICE_BOT_URL } from '$env/static/private'
import type { FullCarData } from '$lib/server/car'
import prisma, { orderBySlot } from '$lib/server/prisma'
import type { CarData, DecalData, TopperData } from '$lib/server/schemas'
import { randomElement } from '$lib/util'
import type { Prisma } from '@prisma/client'
import { decalDefs, type ParamsObject } from 'grace-train-lib/components'
import type { DepotCar } from 'grace-train-lib/trains'

type TrainCarData = Prisma.GraceTrainCarGetPayload<{}>

export async function endAllTrains(exceptTrainId?: number) {
	return await prisma.graceTrain.updateMany({
		data: { ended: true },
		where: { ended: false, id: { not: exceptTrainId } },
	})
}

// TODO: Too many versions of this function exist!
export function transformCarFromDBToGraceTrainCar(car: FullCarData): DepotCar {
	return {
		body: car.body as CarData['body'],
		bodyColor: car.bodyColor || undefined,
		bodyPopColor: car.bodyPopColor || undefined,
		wheelColor: car.wheelColor || undefined,
		wheelFromCenter: car.wheelFromCenter,
		wheelSize: car.wheelSize,
		decals: car.decals.map((d) => {
			const name = d.name as DecalData['name']
			let params = d.params as ParamsObject
			if (Object.keys(params).length === 0)
				params = decalDefs[name].getDefaultParamsObject()
			return {
				name,
				fill: d.fill,
				x: d.x,
				y: d.y,
				scale: d.scale,
				rotate: d.rotate,
				params,
			}
		}),
		toppers: car.toppers.map((t) => ({
			name: t.name as TopperData['name'],
			colors: t.colors,
			position: t.position,
			offset: t.offset,
			scale: t.scale,
			rotate: t.rotate,
		})),
	}
}

// Round-robin algorithm randomly picks among the user's cars
// Prefers cars that appeared least in the current train
// Also avoids picking the last picked car if possible
export function pickUserCar(
	userCars: FullCarData[],
	trainCars: Pick<TrainCarData, 'userId' | 'carId'>[]
): FullCarData {
	if (userCars.length === 1) return userCars[0] // Only one option
	const userId = userCars[0].userId
	const timesInTrainMap = new Map(userCars.map((car) => [car.id, 0]))
	let lastPickedUserCarId: number
	// Count train appearances for each of the user's cars
	for (const trainCar of trainCars) {
		if (trainCar.userId !== userId || !trainCar.carId) continue
		const timesInTrain = timesInTrainMap.get(trainCar.carId)
		lastPickedUserCarId = trainCar.carId
		if (timesInTrain === undefined) continue
		timesInTrainMap.set(trainCar.carId, timesInTrain + 1)
	}
	const leastPicked: Set<FullCarData> = new Set()
	let leastPickedCount = Infinity
	// Make a list of cars with the lowest appearance count
	for (const userCar of userCars) {
		if (userCar.id === lastPickedUserCarId!) continue
		const timesInTrain = timesInTrainMap.get(userCar.id)!
		if (timesInTrain < leastPickedCount) {
			leastPicked.clear()
			leastPickedCount = timesInTrain
		}
		if (timesInTrain === leastPickedCount) {
			leastPicked.add(userCar)
		}
	}
	if (leastPicked.size === 0) return randomElement(userCars) // Just in case I coded badly
	return randomElement([...leastPicked])
}

const incrementAppearancesUpdateQuery = {
	totalAppearances: { increment: 1 },
} as const
export async function incrementGraceTrainTotalAppearances(carId: number) {
	await prisma.graceTrainCarStats.upsert({
		where: { carId: carId },
		create: {
			carId,
			totalAppearances: 1,
		},
		update: incrementAppearancesUpdateQuery,
	})
}

export async function updateGraceTrainCarStatsForTrain(
	carIds: number[],
	trainId: number
) {
	await prisma.graceTrainCarStats.updateMany({
		where: {
			carId: { in: carIds },
			lastGraceTrainId: { not: trainId }, // Exclude cars already updated for this train
		},
		data: {
			graceTrainCount: { increment: 1 },
			lastGraceTrainId: trainId,
		},
	})
}

export const carsIncludeQuery = { decals: orderBySlot, toppers: orderBySlot } as const
export const userCarsIncludeQuery = {
	cars: {
		include: carsIncludeQuery,
		where: { published: true },
	},
} satisfies Prisma.UserInclude

// TODO: Call this when a user deletes their account
export async function hideUserFromOverlay(twitchUserId: string) {
	console.log('hiding user', twitchUserId)
	fetch(`${SPICE_BOT_URL}/depot-user-hide/`, {
		body: JSON.stringify({ userId: twitchUserId }),
		method: 'POST',
		headers: {
			Authorization: DEPOT_SECRET,
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Origin: SPICE_BOT_HOSTNAME,
		},
	}).catch((e) => console.log('error POSTing depot-user-hide to spice-bot', e))
}
