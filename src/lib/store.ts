import { writable, type Writable } from 'svelte/store'
import type { Transform } from './util'
import { type DecalName, type BodyName, COLORS } from 'grace-train-lib'

export type DecalData = {
	name: DecalName
	transform: Transform
	id: number
	fill: string
}

type UserCar = {
	body: BodyName
	decals: DecalData[]
	wheelColor: string
}

export const userCar: Writable<UserCar> = writable({
	body: 'boxy',
	decals: [
		{
			name: 'heart',
			transform: { translate: { x: 375 / 2, y: 120 }, scale: 1, rotate: 0 },
			id: Date.now(),
			fill: '#2ae3ff',
		},
	],
	wheelColor: COLORS.POP,
})
