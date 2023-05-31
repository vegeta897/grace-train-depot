import { userCar } from '$lib/store'
import type { Transform } from '$lib/util'

export const DECAL_MIN_SCALE = 0.5
export const DECAL_MAX_SCALE = 4

export function updateDecalTransform(index: number, transform: Transform) {
	userCar.update((uc) => {
		uc.decals[index].transform = {
			...transform,
			translate: { ...transform.translate },
		}
		return uc
	})
}
