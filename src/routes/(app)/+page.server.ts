import { transformCarFromDB } from '$lib/server/car'
import prisma, { orderBySlot } from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

export const load = (async ({ parent }) => {
	const parentData = await parent()
	if (parentData.user) {
		return {
			savedCars: (
				await prisma.car.findMany({
					where: { userId: parentData.user.userId },
					include: { decals: orderBySlot, toppers: orderBySlot },
					orderBy: { createdAt: 'desc' },
				})
			).map(transformCarFromDB),
		}
	}
}) satisfies PageServerLoad
