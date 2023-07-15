import prisma from '$lib/server/prisma'
import type { LayoutServerLoad } from './$types'

export const load = (async () => {
	return {
		user: await prisma.user.findUniqueOrThrow({
			where: {
				id: 123,
			},
		}),
	}
}) satisfies LayoutServerLoad
