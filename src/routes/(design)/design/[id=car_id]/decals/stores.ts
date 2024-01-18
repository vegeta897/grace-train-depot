import type { DecalDataWithId } from '$lib/server/schemas/decals'
import { defineContext } from '$lib/util'
import { writable } from 'svelte/store'
import type { Transform } from './decals'

// Maybe merge this into design stores?

export const getDecalStores = defineContext({
	hoveredSlot: writable<number | null>(null),
	selectedSlot: writable<number | null>(null),
	dragging: writable<{ slot: number; transform: Transform } | null>(null),
	dirtyCanvas: writable(false),
	previewDecal: writable<DecalDataWithId | null>(null),
})

export type DecalStores = ReturnType<typeof getDecalStores>
