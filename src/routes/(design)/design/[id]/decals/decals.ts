import type { Transform } from '$lib/types'
import type { DesignStores } from '../../stores'

export function updateDecalTransform(
	cars: DesignStores['localCars'],
	shortId: string,
	slot: number,
	transform: Transform
) {
	cars.update((c) => {
		const decal = c[shortId].decals[slot]
		decal.x = Math.round(transform.x)
		decal.y = Math.round(transform.y)
		decal.scale = Math.round(transform.scale * 100) / 100
		decal.rotate = transform.rotate
		return c
	})
}
