import { transformCarFromDBWithIds } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import type { Prisma } from '@prisma/client'
import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load = (async ({ parent }) => {
	const parentData = await parent()
	if (parentData.user) {
		const cars = await getUserCars(parentData.user.userId, 5)
		if (cars.length === 0) redirect(302, '/design/new')
		const carCount = await prisma.car.count({ where: { userId: parentData.user.userId } })
		return {
			cars,
			carCount,
		}
	}
}) satisfies PageServerLoad

async function getUserCars(userId: string, limit?: number) {
	const cars = await prisma.car.findMany({
		take: limit,
		where: { userId },
		include: carsIncludeQuery,
		orderBy: carsOrderByQuery,
	})
	console.log(cars[0])
	return cars.map(transformCarFromDBWithIds)
}

const carsIncludeQuery = {
	decals: { orderBy: { slot: 'asc' } },
	toppers: { orderBy: { slot: 'asc' } },
} satisfies Prisma.CarSelect
const carsOrderByQuery = {
	createdAt: 'desc',
} satisfies Prisma.CarOrderByWithRelationInput
