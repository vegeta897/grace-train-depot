import { transformCarFromDB } from '$lib/car'
import prisma from '$lib/server/prisma'
import type { LayoutServerLoad } from './$types'

export const load = (async ({ params }) => {
	const carData = await prisma.car.findUniqueOrThrow({
		where: { shortId: params.id },
		include: { decals: true },
	})
	return { car: transformCarFromDB(carData) }
}) satisfies LayoutServerLoad
