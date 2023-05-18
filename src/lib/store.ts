import { writable, type Writable } from 'svelte/store'
import type { BodyType } from './body'
import type { DecalName } from './decals'
import type { Transform } from './util'

type UserCar = {
	body: BodyType
	decals: {
		name: DecalName
		transform: Transform
	}[]
}

export const userCar: Writable<UserCar> = writable({
	body: 'boxy',
	decals: [
		{
			name: 'star',
			transform: { translate: { x: 375 / 2, y: 130 }, scale: 2, rotate: 0 },
		},
	],
})
