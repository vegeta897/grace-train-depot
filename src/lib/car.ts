import type { CarData, DecalData, TopperData } from '$lib/schemas'
import type { Prisma } from '@prisma/client'
import { COLORS } from 'grace-train-lib'
import { generateRandomString } from 'lucia/utils'

type FullCarData = Prisma.CarGetPayload<{
	include: { decals: true; toppers: true }
}>

export function transformCarFromDB(carData: FullCarData): CarData {
	return {
		id: carData.id,
		shortId: carData.shortId,
		name: carData.name || undefined,
		published: carData.published,
		revision: carData.revision,
		body: carData.body as CarData['body'],
		wheels: {
			color: carData.wheelColor,
			fromCenter: carData.wheelFromCenter,
		},
		toppers: carData.toppers.map((topper) => ({
			name: topper.name as CarData['toppers'][number]['name'],
			id: topper.id,
			colors: topper.colors,
			position: topper.position,
			adjust: {
				x: topper.adjustX,
				y: topper.adjustY,
				scale: topper.adjustScale,
				rotate: topper.adjustRotate,
			},
		})),
		decals: carData.decals.map((decal) => ({
			name: decal.name as DecalData['name'],
			id: decal.id,
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

export function cloneCar(car: CarData): CarData {
	return {
		...car,
		wheels: {
			...car.wheels,
		},
		toppers: car.toppers.map(cloneTopper),
		decals: car.decals.map(cloneDecal),
	}
}

export function cloneDecal(decal: DecalData): DecalData {
	return { ...decal, transform: { ...decal.transform } }
}

export function cloneTopper(topper: TopperData): TopperData {
	const clone = { ...topper }
	if (topper.adjust) topper.adjust = { ...topper.adjust }
	return clone
}

export function getNewCar(): CarData {
	return {
		id: 0,
		shortId: 'new',
		body: 'boxy',
		decals: [],
		wheels: { color: COLORS.POP, fromCenter: 100 },
		toppers: [],
	}
}

// Length of 8 = 1M IDs before 1% chance of collision (https://zelark.github.io/nano-id-cc/)
const shortIdAlphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const shortIdLength = 8

export const generateCarShortId = () =>
	generateRandomString(shortIdLength, shortIdAlphabet)

export function getCarChangesByPage(original: CarData, maybeChanged: CarData) {
	if (original === maybeChanged) return {}
	// TODO: Ensure props match page names
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
		finish: false,
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
		maybeChanged.colors.join(',') !== original.colors.join(',') ||
		maybeChanged.adjust?.x !== original.adjust?.x ||
		maybeChanged.adjust?.y !== original.adjust?.y ||
		maybeChanged.adjust?.scale !== original.adjust?.scale ||
		maybeChanged.adjust?.rotate !== original.adjust?.rotate
	)
}
