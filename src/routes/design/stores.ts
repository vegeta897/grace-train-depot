import { getNewCar } from '$lib/car'
import type { Car } from '$lib/types'
import { defineContext } from '$lib/util'
import { persisted } from 'svelte-local-storage-store'
import { derived, writable } from 'svelte/store'

const localCars = persisted<Record<string, Car>>('choochoo-localCar', {})
const designShortId = writable<string>('new')
const designCar = derived(
	[localCars, designShortId],
	([$localCars, $designShortId]) =>
		($localCars[$designShortId] || getNewCar()) as Readonly<Car>
)

export const getDesignStores = defineContext({
	localCars,
	designShortId,
	designCar,
})

export type DesignStores = ReturnType<typeof getDesignStores>

// TODO: Export function to update currently designed car
// hasContext?
