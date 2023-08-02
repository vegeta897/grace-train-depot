import { transformCarFromDB } from '$lib/car'
import prisma from '$lib/server/prisma'
import type { LayoutServerLoad } from './$types'

export const load = (async (event) => {
	const session = await event.locals.auth.validate()
	console.log('root layout load')
	// TODO: Move session or user property to locals in hooks file
	if (session) {
		return {
			user: session.user,
			cars: (
				await prisma.car.findMany({
					where: { userId: session.user.userId },
					include: { decals: { orderBy: { slot: 'asc' } } },
				})
			).map(transformCarFromDB),
		}
	}
	return {}
}) satisfies LayoutServerLoad
