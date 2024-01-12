import { transformCarFromDB } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import { carsIncludeQuery } from '../api/train/trains'
import type { PageServerLoad } from './$types'

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
			).map(transformCarFromDB),
		}
	}
}) satisfies PageServerLoad
