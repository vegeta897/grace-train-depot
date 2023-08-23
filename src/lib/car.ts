import type {
	CarData,
	DecalData,
	CarDataWithIds,
	TopperData,
	DecalDataWithId,
} from '$lib/schemas'
import type { Prisma } from '@prisma/client'
import { COLORS } from 'grace-train-lib'
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
		bodyColor: carData.bodyColor || undefined,
		bodyPopColor: carData.bodyPopColor || undefined,
		wheels: {
			color: carData.wheelColor || undefined,
			fromCenter: carData.wheelFromCenter,
		},
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
		decals: carData.decals.map((decal, d) => ({
			name: decal.name as DecalData['name'],
			id: d, // Used as a unique and persistent way to index {each} directives
			transform: {
				x: decal.x,
				y: decal.y,
				rotate: decal.rotate,
				scale: decal.scale,
			},
			slot: decal.slot,
			fill: decal.fill,
		})),
	}
}

export function cloneCar(car: CarDataWithIds): CarDataWithIds {
	return {
		...car,
		wheels: {
			...car.wheels,
		},
		toppers: car.toppers.map((t) => ({ ...t })),
		decals: car.decals.map(cloneDecal),
	}
}

export function cloneDecal(decal: DecalDataWithId): DecalDataWithId {
	return { ...decal, transform: { ...decal.transform } }
}

export function getNewCar(): CarDataWithIds {
	return {
		id: 0,
		shortId: 'new',
		body: 'boxy',
		decals: [],
		wheels: { fromCenter: 100 },
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
			maybeChanged.wheels.color !== original.wheels.color ||
			maybeChanged.wheels.fromCenter !== original.wheels.fromCenter,
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
		maybeChanged.transform.x !== original.transform.x ||
		maybeChanged.transform.y !== original.transform.y ||
		maybeChanged.transform.scale !== original.transform.scale ||
		maybeChanged.transform.rotate !== original.transform.rotate
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
