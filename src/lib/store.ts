import { writable, type Writable } from 'svelte/store'
import type { Transform } from './util'
import type { DecalName, BodyName } from 'grace-train-lib'

type UserCar = {
	body: BodyName
	decals: { name: DecalName; transform: Transform; id: number }[]
}

export const userCar: Writable<UserCar> = writable({
	body: 'boxy',
	decals: [
		{
			name: 'heart',
			transform: { translate: { x: 375 / 2, y: 120 }, scale: 1, rotate: 0 },
			id: Date.now(),
		},
	],
})
