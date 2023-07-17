import type { DecalName, BodyName } from 'grace-train-lib'
import type { Transform } from './util'

export type DecalData = {
	name: DecalName
	transform: Transform
	id: number
	fill: string
}

export type Car = {
	id: number
	shortId: string
	body: BodyName
	decals: DecalData[]
	wheels: {
		color: string
		fromCenter: number
	}
	hat: {
		color: string | null
	}
}