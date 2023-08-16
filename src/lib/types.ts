import type { Prisma } from '@prisma/client'

export type Transform = {
	x: number
	y: number
	scale: number
	rotate: number
}

export type DBCar = Prisma.CarGetPayload<{}>
