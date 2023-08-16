import { transformCarFromDB } from '$lib/car'
import prisma from '$lib/server/prisma'
import type { LayoutServerLoad } from './$types'

export const load = (async (event) => {
	const session = await event.locals.auth.validate()
	console.log('root layout load')
	// TODO: Move session or user property to locals in hooks file
	// TODO: Stream non-essential data https://svelte.dev/blog/streaming-snapshots-sveltekit
	if (session) {
		return {
			user: session.user,
			savedCars: (
				await prisma.car.findMany({
					where: { userId: session.user.userId },
					include: { decals: { orderBy: { slot: 'asc' } }, toppers: true },
					orderBy: { createdAt: 'desc' },
				})
			).map(transformCarFromDB),
		}
	}
	return {}
}) satisfies LayoutServerLoad
