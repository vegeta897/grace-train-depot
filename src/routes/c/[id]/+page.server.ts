import { transformCarFromDB } from '$lib/car'
import prisma from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

export const load = (async ({ params }) => {
	return {
		car: transformCarFromDB(
			await prisma.car.findUniqueOrThrow({
				where: { shortId: params.id },
				include: { decals: { orderBy: { slot: 'asc' } } },
			})
		),
	}
}) satisfies PageServerLoad
