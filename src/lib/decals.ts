import { Star } from 'grace-train-lib'

export const DECALS = [
	{
		name: 'star',
		component: Star,
	},
] as const

export type DecalName = (typeof DECALS)[number]['name']
