import { transformCarFromDB } from '$lib/car'
import prisma from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

export const load = (async ({ parent }) => {
	const parentData = await parent()
	if (parentData.user) {
		return {
			savedCars: (
				await prisma.car.findMany({
					where: { userId: parentData.user.userId },
					include: { decals: { orderBy: { slot: 'asc' } }, toppers: true },
					orderBy: { createdAt: 'desc' },
				})
			).map(transformCarFromDB),
		}
	}
}) satisfies PageServerLoad
