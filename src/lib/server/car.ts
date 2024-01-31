import { generateRandomString } from 'lucia/utils'
import type { DesignCar } from './schemas/car'
import type { SignalName } from '$lib/signals'
import type { DecalData, DepotCar, TopperData } from 'grace-train-lib/data'
import type { Prisma } from '@prisma/client'

export type DBCar = Prisma.CarGetPayload<{ include: { decals: true; toppers: true } }>

// TODO: Clean up types and functions for db car, display car, and design car
// Design car doesn't need signals, only signalGoals
// Only db car and display car need signals
export function transformCarFromDBWithIds(carData: DBCar): DesignCar {
	return {
		id: carData.id,
		shortId: carData.shortId,
		name: carData.name,
		revision: carData.revision,
		signals: carData.signals as SignalName[],
		signalGoals: [],
		...transformCarFromDBToDepotCarWithoutDecalsToppers(carData),
		decals: carData.decals.map((decal, d) => ({
			...transformDecalFromDB(decal),
			id: d, // Used as a unique and persistent way to index {each} directives
			slot: decal.slot,
		})),
		toppers: carData.toppers.map((topper, t) => ({
			...transformTopperFromDB(topper),
			id: t,
			slot: topper.slot,
		})),
	}
}

export const transformDecalFromDB = (
	decal: DBCar['decals'][number]
): DepotCar['decals'][number] => ({
	name: decal.name as DecalData['name'],
	x: decal.x,
	y: decal.y,
	rotate: decal.rotate,
	scale: decal.scale,
	fill: decal.fill as DecalData['fill'],
	params: decal.params as DecalData['params'],
})

export const transformTopperFromDB = (topper: DBCar['toppers'][number]): TopperData => ({
	name: topper.name as TopperData['name'],
	position: topper.position,
	offset: topper.offset,
	scale: topper.scale,
	rotate: topper.rotate,
	params: topper.params as TopperData['params'],
})

export function transformCarFromDBToDepotCarWithoutDecalsToppers(
	car: DBCar
): Omit<DepotCar, 'toppers' | 'decals'> {
	return {
		body: car.body as DepotCar['body'],
		bodyColor: car.bodyColor || undefined,
		bodyPopColor: car.bodyPopColor || undefined,
		wheelBaseColor: car.wheelBaseColor || undefined,
		wheelPopColor: car.wheelPopColor || undefined,
		wheelFlipColors: car.wheelFlipColors || false,
		wheelFromCenter: car.wheelFromCenter,
		wheelSize: car.wheelSize,
	}
}

export function transformCarFromDBToDepotCar(car: DBCar): DepotCar {
	return {
		...transformCarFromDBToDepotCarWithoutDecalsToppers(car),
		decals: car.decals.map(transformDecalFromDB),
		toppers: car.toppers.map(transformTopperFromDB),
	}
}

// Length of 8 = 1M IDs before 1% chance of collision (https://zelark.github.io/nano-id-cc/)
// IMPORTANT: If this changes, update /params/car_id.ts
const shortIdAlphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const shortIdLength = 8
export const generateCarShortId = () =>
	generateRandomString(shortIdLength, shortIdAlphabet)
