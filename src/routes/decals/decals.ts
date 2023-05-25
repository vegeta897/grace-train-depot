import { userCar } from '$lib/store'
import type { Transform } from '$lib/util'

export function updateDecalTransform(index: number, transform: Transform) {
	userCar.update((uc) => {
		uc.decals[index].transform = {
			...transform,
			translate: { ...transform.translate },
		}
		return uc
	})
}
