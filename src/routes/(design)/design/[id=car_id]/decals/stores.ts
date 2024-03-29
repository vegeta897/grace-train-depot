import type { DecalDataWithId } from '$lib/server/schemas/decals'
import { defineContext } from '$lib/util'
import { writable } from 'svelte/store'

// Maybe merge this into design stores?

export const getDecalStores = defineContext({
	hoveredSlot: writable<number | null>(null),
	selectedSlot: writable<number | null>(null),
	dragging: writable<{
		startX: number
		startY: number
		decal: DecalDataWithId
	} | null>(null),
	dirtyCanvas: writable(false),
	previewDecal: writable<DecalDataWithId | null>(null), // TODO: Still used?
	shapePickerTab: writable(0),
	snapping: writable(false),
})

export type DecalStores = ReturnType<typeof getDecalStores>
