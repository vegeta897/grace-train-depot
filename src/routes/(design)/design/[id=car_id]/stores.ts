import { getNewCar } from '$lib/car'
import type { CarDataWithIds } from '$lib/server/schemas/car'
import { defineContext } from '$lib/util'
import { persisted } from 'svelte-persisted-store'
import { derived, get, writable } from 'svelte/store'

const localCars = persisted<Record<string, CarDataWithIds>>('choochoo-localCars', {})
const designShortId = writable<string>('new')
const designCar = derived(
	[localCars, designShortId],
	([$localCars, $designShortId]) =>
		($localCars[$designShortId] || getNewCar()) as Readonly<CarDataWithIds>
)
type Hint = 'dragDecal' | 'dragTopper'

const hints = persisted<Partial<Record<Hint, boolean>>>('choochoo-hints', {})

// TODO: Maybe add a store for original server cars, and derived store for changes

export const getDesignStores = defineContext({
	localCars,
	designShortId,
	designCar,
	hints,
})

export type DesignStores = ReturnType<typeof getDesignStores>

export function setHint(hints: DesignStores['hints'], hint: Hint, value?: boolean) {
	hints.set({ ...get(hints), [hint]: value })
}

// TODO: Export function to update currently designed car
// hasContext?
