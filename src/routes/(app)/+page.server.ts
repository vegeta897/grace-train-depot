import { transformCarFromDBWithIds } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

export const load = (async ({ parent }) => {
	const parentData = await parent()
	if (parentData.user) {
		const savedCars = getUserCars(parentData.user.userId)
		savedCars.catch(() => {})
		return { savedCars }
	}
}) satisfies PageServerLoad

async function getUserCars(userId: string) {
	return (
		await prisma.car.findMany({
			where: { userId },
			include: carsIncludeQuery,
			orderBy: carsOrderByQuery,
		})
	).map(transformCarFromDBWithIds)
}

const orderBySlot = { orderBy: { slot: 'asc' } } as const
const carsIncludeQuery = { decals: orderBySlot, toppers: orderBySlot } as const
const carsOrderByQuery = { createdAt: 'desc' } as const
