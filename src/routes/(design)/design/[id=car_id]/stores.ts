import { getNewDesignCar } from '$lib/car'
import type { DesignCar } from '$lib/server/schemas/car'
import { defineContext } from '$lib/util'
import { persisted } from 'svelte-persisted-store'
import { derived, get, writable } from 'svelte/store'

const localCars = persisted<Record<string, DesignCar>>('choochoo-localCars', {})
const designShortId = writable<string>('new')
const designCar = derived(
	[localCars, designShortId],
	([$localCars, $designShortId]) =>
		($localCars[$designShortId] || getNewDesignCar()) as Readonly<DesignCar>
)
type Hint = 'dragDecal' | 'dragTopper'

const hints = persisted<Partial<Record<Hint, boolean>>>('choochoo-hints', {})

// TODO: Maybe add a store for original server cars, and derived store for changes

export const getDesignStores = defineContext({
	localCars,
	designShortId,
	designCar,
	hints,
	// TODO: Export similar function(s) for decal stores
	updateDesignCar(update: (car: DesignCar) => DesignCar | void) {
		const shortId = get(designShortId)
		localCars.update((localCars) => {
			const localCar = localCars[shortId]
			const updated = update(localCar)
			if (updated) localCars[shortId] = updated
			return localCars
		})
	},
	setHint(hint: Hint, value?: boolean) {
		hints.set({ ...get(hints), [hint]: value })
	},
})

export type DesignStores = ReturnType<typeof getDesignStores>
