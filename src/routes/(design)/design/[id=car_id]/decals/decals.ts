import { decalDefs } from 'grace-train-lib/components'
import type { DesignStores } from '../stores'
import { DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
import { degToRad } from '$lib/util'
import type { DecalData } from 'grace-train-lib/data'

export function updateDecalTransform(
	cars: DesignStores['localCars'],
	shortId: string,
	slot: number,
	transform: Transform
) {
	cars.update((c) => {
		const decal = c[shortId].decals[slot]
		const decalDef = decalDefs[decal.name]
		const minScale = decalDef.minScale || DECAL_MIN_SCALE
		const maxScale = decalDef.maxScale || DECAL_MAX_SCALE
		decal.scale = Math.max(
			minScale,
			Math.min(maxScale, Math.round(transform.scale * 500) / 500)
		)
		decal.rotate = transform.rotate
		const radians = degToRad(decal.rotate)
		const xComponent = Math.abs(Math.cos(radians))
		const yComponent = Math.abs(Math.sin(radians))
		const reach = (xComponent + yComponent) * 40 * decal.scale
		decal.x = Math.round(Math.max(-reach, Math.min(375 + reach, transform.x)))
		decal.y = Math.round(Math.max(25 - reach, Math.min(200 + reach, transform.y)))
		return c
	})
}

export function removeDecal(
	cars: DesignStores['localCars'],
	shortId: string,
	slot: number
) {
	cars.update((c) => {
		c[shortId].decals = c[shortId].decals.filter((_, i) => i !== slot)
		c[shortId].decals.forEach((d, i) => (d.slot = i)) // Re-number slots
		return c
	})
}

export function getDecalBoundingBox(decal: DecalData) {
	return decalDefs[decal.name].getBoundingBox(decal.params)
}

export type Transform = {
	x: number
	y: number
	scale: number
	rotate: number
}
