import { generateRandomString } from 'lucia/utils'
import type { Prisma } from '@prisma/client'
import type { ParamsObject } from 'grace-train-lib/components'
import { decalDefs } from 'grace-train-lib/components'
import type { CarDataWithIds, CarData, TopperData, DecalData } from './schemas'

export type FullCarData = Prisma.CarGetPayload<{
	include: { decals: true; toppers: true }
}>

export function transformCarFromDB(carData: FullCarData): CarDataWithIds {
	return {
		id: carData.id,
		shortId: carData.shortId,
		name: carData.name || undefined,
		published: carData.published,
		revision: carData.revision,
		body: carData.body as CarData['body'],
		bodyColor: (carData.bodyColor || undefined) as CarData['bodyColor'],
		bodyPopColor: (carData.bodyPopColor || undefined) as CarData['bodyPopColor'],
		wheelColor: (carData.wheelColor || undefined) as CarData['wheelColor'],
		wheelFromCenter: carData.wheelFromCenter,
		toppers: carData.toppers.map((topper, t) => ({
			name: topper.name as TopperData['name'],
			id: t, // Used as a unique and persistent way to index {each} directives
			colors: topper.colors,
			position: topper.position,
			slot: topper.slot,
			offset: topper.offset,
			scale: topper.scale,
			rotate: topper.rotate,
		})),
		decals: carData.decals.map((decal, d) => {
			const name = decal.name as DecalData['name']
			let params = decal.params as ParamsObject
			// Get default params if empty
			if (Object.keys(params).length === 0)
				params = decalDefs[name].getDefaultParamsObject()
			return {
				name,
				id: d, // Used as a unique and persistent way to index {each} directives
				x: decal.x,
				y: decal.y,
				rotate: decal.rotate,
				scale: decal.scale,
				slot: decal.slot,
				fill: decal.fill as DecalData['fill'],
				params,
			}
		}),
	}
}

// Length of 8 = 1M IDs before 1% chance of collision (https://zelark.github.io/nano-id-cc/)
const shortIdAlphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const shortIdLength = 8
export const generateCarShortId = () =>
	generateRandomString(shortIdLength, shortIdAlphabet)
