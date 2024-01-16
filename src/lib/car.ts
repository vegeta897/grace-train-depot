import type {
	DecalData,
	CarDataWithIds,
	TopperData,
	DecalDataWithId,
	CarData,
} from '$lib/server/schemas/car'
import { body, getYposition, topperDefs } from 'grace-train-lib/components'
import { degToRad } from './util'
import { COLOR_NAMES } from 'grace-train-lib'

export function cloneCar(car: CarDataWithIds): CarDataWithIds {
	return {
		...car,
		toppers: car.toppers.map((t) => ({ ...t })),
		decals: car.decals.map(cloneDecal),
	}
}

export function cloneDecal(decal: DecalDataWithId): DecalDataWithId {
	return { ...decal, params: JSON.parse(JSON.stringify(decal.params)) }
}

export function getNewCar(): CarDataWithIds {
	return {
		id: 0,
		name: '',
		shortId: 'new',
		body: 'boxy',
		decals: [],
		wheelFromCenter: 100,
		wheelSize: 25,
		wheelColor: COLOR_NAMES.POP.POP,
		toppers: [],
	}
}

// TODO: This might be overkill and lead to user confusion
// Just add a "modified" boolean in the design stores that gets changed to true whenever you change anything
// Maybe run this function once before saving to allow the server to silently skip updating the db
export function getCarChangesByPage(
	original: CarDataWithIds,
	maybeChanged: CarDataWithIds
) {
	if (original === maybeChanged) return {}
	return {
		body: maybeChanged.body !== original.body,
		toppers:
			maybeChanged.toppers.length !== original.toppers.length ||
			maybeChanged.toppers.some((md, i) => topperIsDifferent(original.toppers[i], md)),
		wheels:
			maybeChanged.wheelColor !== original.wheelColor ||
			maybeChanged.wheelFromCenter !== original.wheelFromCenter ||
			maybeChanged.wheelSize !== original.wheelSize,
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
		maybeChanged.rotate !== original.rotate
	)
}

type Bounds = { top: number; left: number; right: number; bottom: number }

export function getCarBounds(
	car: CarData | CarDataWithIds,
	minBounds: Partial<Bounds> = {}
) {
	const bounds = Object.assign({ top: 0, left: 0, right: 375, bottom: 300 }, minBounds)
	if (car.toppers.length === 0) return bounds
	const topLine = body[car.body].topperLine
	const topLineWidth = topLine[topLine.length - 1][0] - topLine[0][0]
	for (const topper of car.toppers) {
		const { origin, getBoundingBox } = topperDefs[topper.name]
		const boundingBox = getBoundingBox()
		const x = topLine[0][0] + topLineWidth * topper.position
		const y = getYposition(x, topLine)
		const radians = degToRad(topper.rotate)
		const cos = Math.cos(radians)
		const sin = Math.sin(radians)
		const rotatedHeight =
			(Math.abs(origin.x * sin) + Math.abs(origin.y * cos)) * topper.scale
		const widthCos = origin.x * cos
		const lowerHeight = origin.y - boundingBox.height
		const topperLeft =
			x +
			Math.min(-widthCos + origin.y * sin, -widthCos + lowerHeight * sin) * topper.scale
		const topperRight =
			x + Math.max(widthCos + origin.y * sin, widthCos + lowerHeight * sin) * topper.scale
		const topperTop = y - rotatedHeight - topper.offset
		if (topperTop < bounds.top) bounds.top = topperTop
		if (topperLeft < bounds.left) bounds.left = topperLeft
		if (topperRight > bounds.right) bounds.right = topperRight
	}
	return bounds
}

export const getCarViewBox = (
	car: CarData | CarDataWithIds,
	minBounds?: Partial<Bounds>
) => boundsToViewbox(getCarBounds(car, minBounds))

export const boundsToViewbox = (bounds: Bounds) =>
	`${bounds.left} ${bounds.top} ${bounds.right - bounds.left} ${
		bounds.bottom - bounds.top
	}`
