import type { Transform } from '$lib/types'
import type { DesignStores } from '../stores'

export const DECAL_RADIUS = 50 * Math.SQRT2

export function updateDecalTransform(
	cars: DesignStores['localCars'],
	shortId: string,
	slot: number,
	transform: Transform
) {
	cars.update((c) => {
		const decal = c[shortId].decals[slot]
		decal.scale = Math.round(transform.scale * 500) / 500
		decal.rotate = transform.rotate
		const radians = (decal.rotate / 180) * Math.PI
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
