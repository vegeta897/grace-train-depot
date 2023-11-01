import type { Transform } from '$lib/types'
import { defineContext } from '$lib/util'
import { writable } from 'svelte/store'

// Maybe merge this into design stores?

export const getDecalStores = defineContext({
	hoveredSlot: writable<number | null>(null),
	selectedSlot: writable<number | null>(null),
	dragging: writable<{ slot: number; transform: Transform } | null>(null),
	deleteMode: writable(false),
	dirtyCanvas: writable(false),
})

export type DecalStores = ReturnType<typeof getDecalStores>
