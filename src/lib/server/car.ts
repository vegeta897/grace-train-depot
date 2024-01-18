import { generateRandomString } from 'lucia/utils'
import type { Prisma } from 'grace-train-lib/prisma'
import type { ParamsObject } from 'grace-train-lib/components'
import { decalDefs, topperDefs } from 'grace-train-lib/components'
import type { CarDataWithIds, CarData, TopperData, DecalData } from './schemas/car'
import type { DepotCar } from 'grace-train-lib/trains'

export type DBCar = Prisma.CarGetPayload<{ include: { decals: true; toppers: true } }>

export function transformCarFromDBWithIds(carData: DBCar): CarDataWithIds {
	return {
		id: carData.id,
		shortId: carData.shortId,
		name: carData.name,
		published: carData.published,
		revision: carData.revision,
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

function transformDecalFromDB(
	decal: DBCar['decals'][number]
): DepotCar['decals'][number] {
	const name = decal.name as DecalData['name']
	let params = decal.params as ParamsObject
	// Get default params if empty
	if (Object.keys(params).length === 0) params = decalDefs[name].getDefaultParamsObject()
	return {
		name,
		x: decal.x,
		y: decal.y,
		rotate: decal.rotate,
		scale: decal.scale,
		fill: decal.fill as DecalData['fill'],
		params,
	}
}

function transformTopperFromDB(
	topper: DBCar['toppers'][number]
): DepotCar['toppers'][number] {
	const name = topper.name as TopperData['name']
	let params = topper.params as ParamsObject
	// Get default params if empty
	if (Object.keys(params).length === 0) params = topperDefs[name].getDefaultParamsObject()
	return {
		name: topper.name as TopperData['name'],
		position: topper.position,
		offset: topper.offset,
		scale: topper.scale,
		rotate: topper.rotate,
		params,
	}
}

function transformCarFromDBToDepotCarWithoutDecalsToppers(
	car: DBCar
): Omit<DepotCar, 'toppers' | 'decals'> {
	return {
		body: car.body as CarData['body'],
		bodyColor: car.bodyColor || (undefined as CarData['bodyColor']),
		bodyPopColor: car.bodyPopColor || (undefined as CarData['bodyPopColor']),
		wheelColor: car.wheelColor || (undefined as CarData['wheelColor']),
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
