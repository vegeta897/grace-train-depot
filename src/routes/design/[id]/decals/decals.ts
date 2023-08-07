import type { Transform } from '$lib/types'
import type { DesignStores } from '../../stores'

export function updateDecalTransform(
	car: DesignStores['localCar'],
	slot: number,
	transform: Transform
) {
	car.update((car) => {
		car.decals[slot].transform = { ...transform }
		return car
	})
}
