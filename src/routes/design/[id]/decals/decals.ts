import type { Transform } from '$lib/types'
import type { DecalStores } from './stores'

export function updateDecalTransform(
	decals: DecalStores['decals'],
	slot: number,
	transform: Transform
) {
	decals.update((d) => {
		d[slot].transform = { ...transform }
		return d
	})
}
