import type { Car, DecalData } from '$lib/types'
import { Prisma } from '@prisma/client'
import { COLORS } from 'grace-train-lib'
import { generateRandomString } from 'lucia/utils'

const carWithDecals = Prisma.validator<Prisma.CarDefaultArgs>()({
	include: { decals: true },
})
type CarWithDecals = Prisma.CarGetPayload<typeof carWithDecals>

export function transformCarFromDB(carData: CarWithDecals): Car {
	return {
		id: carData.id,
		shortId: carData.shortId,
		name: carData.name || undefined,
		published: carData.published,
		body: carData.body as Car['body'],
		wheels: {
			color: carData.wheelColor,
			fromCenter: carData.wheelFromCenter,
		},
		hat: { color: carData.hatColor },
		decals: carData.decals.map((decal) => ({
			transform: {
				x: decal.x,
				y: decal.y,
				rotate: decal.rotate,
				scale: decal.scale,
			},
			slot: decal.slot,
			id: decal.id,
			name: decal.name as DecalData['name'],
			fill: decal.fill,
		})),
	}
}

export function cloneCar(car: Car): Car {
	return {
		...car,
		wheels: {
			...car.wheels,
		},
		hat: { ...car.hat },
		decals: car.decals.map(cloneDecal),
	}
}

export function cloneDecal(decal: DecalData): DecalData {
	return { ...decal, transform: { ...decal.transform } }
}

export function getNewCar(): Car {
	return {
		id: 0,
		shortId: 'new',
		body: 'boxy',
		decals: [],
		wheels: { color: COLORS.POP, fromCenter: 100 },
		hat: { color: null },
	}
}

// Length of 8 = 1M IDs before 1% chance of collision (https://zelark.github.io/nano-id-cc/)
const shortIdAlphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const shortIdLength = 8

export const generateCarShortId = () =>
	generateRandomString(shortIdLength, shortIdAlphabet)

export function getCarChangesByPage(original: Car, maybeChanged: Car) {
	if (original === maybeChanged) return {}
	// TODO: Ensure props match page names
	return {
		body: maybeChanged.body !== original.body,
		caps: maybeChanged.hat.color !== original.hat.color,
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
		maybeChanged.transform.x !== original.transform.x ||
		maybeChanged.transform.y !== original.transform.y ||
		maybeChanged.transform.scale !== original.transform.scale ||
		maybeChanged.transform.rotate !== original.transform.rotate ||
		maybeChanged.slot !== original.slot
	)
}
