import type { DBCar } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import { randomElement } from '$lib/util'
import type { Prisma } from '@prisma/client'

type TrainCarData = Prisma.GraceTrainCarGetPayload<{}>

// Round-robin algorithm randomly picks among the user's cars
// Prefers cars that appeared least in the current train
// Also avoids picking the last picked car if possible
export function pickUserCar(
	userCars: DBCar[],
	trainCars: Pick<TrainCarData, 'userId' | 'carId'>[],
	theme: string | null
): DBCar {
	if (userCars.length === 1) return userCars[0] // Only one option
	const userId = userCars[0].userId
	const timesInTrainMap = new Map(userCars.map((car) => [car.id, 0]))
	let previousPickedUserCarId: number
	// Count train appearances for each of the user's cars
	for (const trainCar of trainCars) {
		if (trainCar.userId !== userId || !trainCar.carId) continue
		const timesInTrain = timesInTrainMap.get(trainCar.carId)
		previousPickedUserCarId = trainCar.carId
		if (timesInTrain === undefined) continue
		timesInTrainMap.set(trainCar.carId, timesInTrain + 1)
	}
	const leastPicked: Set<DBCar> = new Set()
	let leastPickedCount = Infinity
	// Make a list of cars with the lowest appearance count
	for (const userCar of userCars) {
		if (userCar.id === previousPickedUserCarId!) continue
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

export async function incrementGraceTrainTotalAppearances(carId: number) {
	await prisma.graceTrainCarStats.upsert({
		where: { carId: carId },
		create: { carId, totalAppearances: 1 },
		update: { totalAppearances: { increment: 1 } },
	})
}

export async function updateGraceTrainCarStatsForTrain(
	carIds: number[],
	trainId: number
) {
	await prisma.graceTrainCarStats.updateMany({
		// Exclude cars already updated for this train
		where: { carId: { in: carIds }, lastGraceTrainId: { not: trainId } },
		data: { graceTrainCount: { increment: 1 }, lastGraceTrainId: trainId },
	})
}

const orderBySlot = { orderBy: { slot: 'asc' } } as const
export const userCarsIncludeQuery = {
	cars: { include: { decals: orderBySlot, toppers: orderBySlot } },
} satisfies Prisma.UserInclude
