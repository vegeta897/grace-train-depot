import { getNewCar } from '$lib/car'
import type { Car } from '$lib/types'
import { defineContext } from '$lib/util'
import { persisted } from 'svelte-local-storage-store'
import { derived, writable } from 'svelte/store'

const localCars = persisted<Record<string, Car>>('choochoo-localCar', {})
const displayCars = derived(
	localCars,
	($localCars) => ($localCars || {}) as Readonly<Record<string, Readonly<Car>>>
)
const designShortId = writable<string>('new')
const displayCar = derived(
	[displayCars, designShortId],
	([$displayCars, $designShortId]) =>
		$displayCars[$designShortId] || (getNewCar() as Readonly<Car>)
)

export const getDesignStores = defineContext({
	localCars: localCars,
	displayCars: displayCars,
	designShortId,
	displayCar,
})

export type DesignStores = ReturnType<typeof getDesignStores>
