import { defineContext } from '$lib/util'
import { writable } from 'svelte/store'

// Maybe merge this into design stores?

export const getDecalStores = defineContext({
	hoveredSlot: writable<number | null>(null),
	selectedSlot: writable<number | null>(null),
})

export type DecalStores = ReturnType<typeof getDecalStores>
