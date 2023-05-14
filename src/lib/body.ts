import { TankerCar, TrainCar } from 'grace-train-lib'

export const BODY = [
	{
		name: 'boxy',
		component: TrainCar,
	},
	{
		name: 'tanky',
		component: TankerCar,
	},
] as const

export type BodyType = (typeof BODY)[number]['name']
