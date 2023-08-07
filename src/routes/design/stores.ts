import { getNewCar } from '$lib/car'
import type { Car } from '$lib/types'
import { defineContext } from '$lib/util'
import { persisted } from 'svelte-local-storage-store'
import { derived } from 'svelte/store'

const localCar = persisted<Car>('choochoo-localCar', getNewCar())
const displayCar = derived(
	localCar,
	($localCar) => ($localCar || getNewCar()) as Readonly<Car>
)

export const getDesignStores = defineContext({ localCar, displayCar })

export type DesignStores = ReturnType<typeof getDesignStores>
