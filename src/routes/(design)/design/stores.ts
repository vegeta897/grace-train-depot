import { getNewCar } from '$lib/car'
import type { CarDataWithIds } from '$lib/server/schemas'
import { defineContext } from '$lib/util'
import { persisted } from 'svelte-persisted-store'
import { derived, writable } from 'svelte/store'

const localCars = persisted<Record<string, CarDataWithIds>>('choochoo-localCars', {})
const designShortId = writable<string>('new')
const designCar = derived(
	[localCars, designShortId],
	([$localCars, $designShortId]) =>
		($localCars[$designShortId] || getNewCar()) as Readonly<CarDataWithIds>
)

// TODO: Maybe add a store for original server cars, and derived store for changes

export const getDesignStores = defineContext({
	localCars,
	designShortId,
	designCar,
})

export type DesignStores = ReturnType<typeof getDesignStores>

// TODO: Export function to update currently designed car
// hasContext?
