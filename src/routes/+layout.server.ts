import { transformCarFromDB } from '$lib/car'
import prisma from '$lib/server/prisma'
import type { LayoutServerLoad } from './$types'

export const load = (async (event) => {
	const session = await event.locals.auth.validate()
	// TODO: Move session or user property to locals in hooks file
	if (session) {
		return {
			user: session.user,
			cars: (
				await prisma.car.findMany({
					where: { userId: session.user.userId },
					include: { decals: true },
				})
			).map(transformCarFromDB),
		}
	}
	return {}
}) satisfies LayoutServerLoad
