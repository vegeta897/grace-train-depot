import type { DecalData } from '$lib/types'
import { defineContext } from '$lib/util'
import { writable, derived } from 'svelte/store'

// TODO: Store modified decals in local storage?

// This is a sparse array, explicit null checks may be needed
const hoveredSlot = writable<number | null>(null)
const selectedSlot = writable<number | null>(null)
const decals = writable<DecalData[]>([])
const draggables = derived(decals, ($decals) => {
	return $decals.map((d) => ({ id: d.id, ...d.transform }))
})

export const getDecalStores = defineContext({
	hoveredSlot,
	selectedSlot,
	decals,
	draggables,
})

export type DecalStores = ReturnType<typeof getDecalStores>
