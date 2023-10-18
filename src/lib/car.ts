import type {
	CarData,
	DecalData,
	CarDataWithIds,
	TopperData,
	DecalDataWithId,
} from '$lib/server/schemas'
import type { Prisma } from '@prisma/client'
import type { ParamsObject } from 'grace-train-lib/components'
import { decalDefs } from 'grace-train-lib/components'
import type { GraceTrainCar } from 'grace-train-lib/trains'
import { generateRandomString } from 'lucia/utils'

type FullCarData = Prisma.CarGetPayload<{
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

export function cloneCar(car: CarDataWithIds): CarDataWithIds {
	return {
		...car,
		toppers: car.toppers.map((t) => ({ ...t })),
		decals: car.decals.map(cloneDecal),
	}
}

export function cloneDecal(decal: DecalDataWithId): DecalDataWithId {
	return { ...decal, params: { ...decal.params } }
}

export function getNewCar(): CarDataWithIds {
	return {
		id: 0,
		shortId: 'new',
		body: 'boxy',
		decals: [],
		wheelFromCenter: 100,
		toppers: [],
	}
}

// Length of 8 = 1M IDs before 1% chance of collision (https://zelark.github.io/nano-id-cc/)
const shortIdAlphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const shortIdLength = 8

export const generateCarShortId = () =>
	generateRandomString(shortIdLength, shortIdAlphabet)

// TODO: This might be overkill and lead to user confusion
// Just add a "modified" boolean in the design stores that gets changed to true whenever you change anything
// Maybe run this function once before saving to allow the server to silently skip updating the db
export function getCarChangesByPage(original: CarData, maybeChanged: CarData) {
	if (original === maybeChanged) return {}
	return {
		body: maybeChanged.body !== original.body,
		toppers:
			maybeChanged.toppers.length !== original.toppers.length ||
			maybeChanged.toppers.some((md, i) => topperIsDifferent(original.toppers[i], md)),
		wheels:
			maybeChanged.wheelColor !== original.wheelColor ||
			maybeChanged.wheelFromCenter !== original.wheelFromCenter,
		decals:
			maybeChanged.decals.length !== original.decals.length ||
			maybeChanged.decals.some((md, i) => decalIsDifferent(original.decals[i], md)),
		effects: false,
	}
}

function decalIsDifferent(original: DecalData, maybeChanged: DecalData) {
	return (
		maybeChanged.fill !== original.fill ||
		maybeChanged.name !== original.name ||
		maybeChanged.slot !== original.slot ||
		maybeChanged.x !== original.x ||
		maybeChanged.y !== original.y ||
		maybeChanged.scale !== original.scale ||
		maybeChanged.rotate !== original.rotate
	)
}

function topperIsDifferent(original: TopperData, maybeChanged: TopperData) {
	return (
		maybeChanged.name !== original.name ||
		maybeChanged.position !== original.position ||
		maybeChanged.slot !== original.slot ||
		maybeChanged.offset !== original.offset ||
		maybeChanged.scale !== original.scale ||
		maybeChanged.rotate !== original.rotate ||
		maybeChanged.colors.join(',') !== original.colors.join(',')
	)
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
