import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import prisma from '$lib/server/prisma'
import { transformCarFromDB } from '$lib/car'

export const load = (async ({ params, locals }) => {
	console.log('design layout server load')
	if (params.id === 'new') return {}
	const session = await locals.auth.validate()
	if (!session) throw redirect(302, `/login?redirectTo=/design/${params.id}`)
	const savedCar = await prisma.car.findUnique({
		where: { shortId: params.id, userId: session.user.userId },
		include: { decals: true, toppers: true },
	})
	if (savedCar)
		return {
			user: session.user,
			savedCar: transformCarFromDB(savedCar),
		}
	throw redirect(302, '/')
}) satisfies LayoutServerLoad
