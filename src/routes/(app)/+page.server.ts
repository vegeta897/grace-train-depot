import { transformCarFromDBWithIds } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

const orderBySlot = { orderBy: { slot: 'asc' } } as const
const carsIncludeQuery = { decals: orderBySlot, toppers: orderBySlot } as const
const carsOrderByQuery = { createdAt: 'desc' } as const

export const load = (async ({ parent }) => {
	const parentData = await parent()
	if (parentData.user) {
		return {
			savedCars: (
				await prisma.car.findMany({
					where: { userId: parentData.user.userId },
					include: carsIncludeQuery,
					orderBy: carsOrderByQuery,
				})
			).map(transformCarFromDBWithIds),
		}
	}
}) satisfies PageServerLoad
