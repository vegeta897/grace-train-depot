import type { Transform } from '$lib/util'
import type { DecalStores } from './stores'

export function updateDecalTransform(
	decals: DecalStores['decals'],
	slot: number,
	transform: Transform
) {
	decals.update((d) => {
		d[slot].transform = { ...transform, translate: { ...transform.translate } }
		return d
	})
}
