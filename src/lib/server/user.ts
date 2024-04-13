import type { Prisma } from '@prisma/client'
import { transformCarFromDBWithIds } from './car'
import prisma from './prisma'

export async function getUserCars(userId: string, limit?: number) {
	const cars = await prisma.car.findMany({
		take: limit,
		where: { userId },
		include: carsIncludeQuery,
		orderBy: carsOrderByQuery,
	})
	return cars.map(transformCarFromDBWithIds)
}

const carsIncludeQuery = {
	decals: { orderBy: { slot: 'asc' } },
	toppers: { orderBy: { slot: 'asc' } },
} satisfies Prisma.CarSelect
const carsOrderByQuery = {
	createdAt: 'desc',
} satisfies Prisma.CarOrderByWithRelationInput
