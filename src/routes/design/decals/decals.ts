import type { Car } from '$lib/types'
import type { Transform } from '$lib/util'

export const DECAL_MIN_SCALE = 0.5
export const DECAL_MAX_SCALE = 4

export function updateDecalTransform(car: Car, index: number, transform: Transform) {
	car.decals[index].transform = {
		...transform,
		translate: { ...transform.translate },
	}
}
