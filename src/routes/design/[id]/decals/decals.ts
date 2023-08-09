import type { Transform } from '$lib/types'
import type { DesignStores } from '../../stores'

export function updateDecalTransform(
	cars: DesignStores['localCars'],
	shortId: string,
	slot: number,
	transform: Transform
) {
	cars.update((c) => {
		c[shortId].decals[slot].transform = {
			x: Math.round(transform.x),
			y: Math.round(transform.y),
			scale: Math.round(transform.scale * 100) / 100,
			rotate: Math.round(transform.rotate * 10) / 10,
		}
		return c
	})
}
