import type {
	CarData,
	DecalData,
	CarDataWithIds,
	TopperData,
	DecalDataWithId,
} from '$lib/server/schemas'

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
		wheelSize: 25,
		toppers: [],
	}
}

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
		maybeChanged.rotate !== original.rotate ||
		maybeChanged.colors.join(',') !== original.colors.join(',')
	)
}
