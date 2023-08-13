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
	new?: boolean
}

// TODO: Make all design related props optional or arrays so a clean design has less data
export type CarData = {
	id: number
	shortId: string
	name?: string
	published?: boolean
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
