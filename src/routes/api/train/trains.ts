import type { FullCarData } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import type { DecalData, TopperData } from '$lib/server/schemas'
import { randomElement } from '$lib/util'
import type { Prisma } from '@prisma/client'
import { decalDefs, type ParamsObject } from 'grace-train-lib/components'
import type { GraceTrainCar } from 'grace-train-lib/trains'

type TrainCarData = Prisma.GraceTrainCarGetPayload<{}>

export async function endAllTrains(exceptTrainId?: number) {
	return await prisma.graceTrain.updateMany({
		data: { ended: true },
		where: { ended: false, id: { not: exceptTrainId } },
	})
}

export function transformCarFromDBToGraceTrainCar(car: FullCarData): GraceTrainCar {
	return {
		body: car.body,
		bodyColor: car.bodyColor || undefined,
		bodyPopColor: car.bodyPopColor || undefined,
		wheelColor: car.wheelColor || undefined,
		wheelFromCenter: car.wheelFromCenter,
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

// Round-robin algorithm to randomly pick among the user's cars that appeared the least
// Also avoids picking the last picked car if possible
export function pickUserCar(
	userCars: FullCarData[],
	trainCars: Pick<TrainCarData, 'userId' | 'carId'>[]
) {
	if (userCars.length === 1) return userCars[0]
	const userId = userCars[0].userId
	const timesInTrainMap = new Map(userCars.map((uc) => [uc.id, 0]))
	let lastPickedUserCarId: number
	for (const trainCar of trainCars) {
		if (trainCar.userId !== userId || !trainCar.carId) continue
		const timesInTrain = timesInTrainMap.get(trainCar.carId)
		lastPickedUserCarId = trainCar.carId
		if (timesInTrain === undefined) continue
		timesInTrainMap.set(trainCar.carId, timesInTrain + 1)
	}
	const leastPicked: Set<FullCarData> = new Set()
	let leastPickedCount = Infinity
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

export async function incrementGraceTrainTotalAppearances(carId: number) {
	await prisma.graceTrainCarStats.upsert({
		where: { carId: carId },
		create: {
			carId,
			totalAppearances: 1,
		},
		update: {
			totalAppearances: { increment: 1 },
		},
	})
}

export async function updateGraceTrainCarStatsForTrain(
	carIds: number[],
	trainId: number
) {
	await prisma.graceTrainCarStats.updateMany({
		where: { carId: { in: carIds }, lastGraceTrainId: { not: trainId } },
		data: {
			graceTrainCount: { increment: 1 },
			lastGraceTrainId: trainId,
		},
	})
}
