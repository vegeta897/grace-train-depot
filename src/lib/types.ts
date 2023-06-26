import type { DecalName, BodyName } from 'grace-train-lib'
import type { Transform } from './util'

export type DecalData = {
	name: DecalName
	transform: Transform
	id: number
	fill: string
}

export type Car = {
	body: BodyName
	decals: DecalData[]
	wheels: {
		color: string
		fromCenter: number
	}
}
