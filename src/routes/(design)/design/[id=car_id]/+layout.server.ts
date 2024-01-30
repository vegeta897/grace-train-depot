import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import prisma from '$lib/server/prisma'
import { transformCarFromDBWithIds } from '$lib/server/car'
import type { User } from 'lucia'
import type { DesignCar } from '$lib/server/schemas/car'

const carIncludeQuery = { decals: true, toppers: true } as const

export const load = (async ({ params, locals }) => {
	// console.log('/design/ layout server load')
	// Redirect bots to car page
	if (locals.botAgent) redirect(302, params.id === 'new' ? '/' : `/c/${params.id}`)
	const data: { user?: User; savedCar?: DesignCar; firstCar: boolean } = {
		firstCar: true,
	}
	const session = await locals.auth.validate()
	if (session) {
		data.user = session.user
		data.firstCar = !(await prisma.car.findFirst())
	}
	if (params.id === 'new') return data
	if (!session) redirect(302, `/login?redirectTo=/design/${params.id}`)
	const savedCar = await prisma.car.findUnique({
		where: { shortId: params.id, userId: session.user.userId },
		include: carIncludeQuery,
	})
	if (savedCar) {
		data.savedCar = transformCarFromDBWithIds(savedCar)
		return data
	}
	// Car doesn't belong to logged in user, redirect to car page
	redirect(302, `/c/${params.id}`)
}) satisfies LayoutServerLoad
