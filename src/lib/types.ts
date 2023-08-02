import type { DecalName, BodyName } from 'grace-train-lib'

export type Transform = {
	x: number
	y: number
	scale: number
	rotate: number
}

export type DecalData = {
	name: DecalName
	transform: Transform
	id: number
	fill: string
	fillPreview?: string
	slot: number
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
