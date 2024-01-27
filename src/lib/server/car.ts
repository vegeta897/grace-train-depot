import { generateRandomString } from 'lucia/utils'
import type { Prisma } from 'grace-train-lib/prisma'
import type { CarDataWithIds } from './schemas/car'
import {
	transformCarFromDBToDepotCarWithoutDecalsToppers,
	transformDecalFromDB,
	transformTopperFromDB,
} from 'grace-train-lib/data'

export type DBCar = Prisma.CarGetPayload<{ include: { decals: true; toppers: true } }>

export function transformCarFromDBWithIds(carData: DBCar): CarDataWithIds {
	return {
		id: carData.id,
		shortId: carData.shortId,
		name: carData.name,
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

// Length of 8 = 1M IDs before 1% chance of collision (https://zelark.github.io/nano-id-cc/)
// IMPORTANT: If this changes, update /params/car_id.ts
const shortIdAlphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const shortIdLength = 8
export const generateCarShortId = () =>
	generateRandomString(shortIdLength, shortIdAlphabet)
