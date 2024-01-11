import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import prisma from '$lib/server/prisma'
import { transformCarFromDB } from '$lib/server/car'
import type { User } from 'lucia'
import type { CarDataWithIds } from '$lib/server/schemas'

const carIncludeQuery = { decals: true, toppers: true } as const

export const load = (async ({ params, locals }) => {
	console.log('/design/ layout server load')
	// Redirect bots to car page
	if (locals.botAgent) redirect(302, params.id === 'new' ? '/' : `/c/${params.id}`);
	const data: { user?: User; savedCar?: CarDataWithIds } = {}
	const session = await locals.auth.validate()
	if (session) data.user = session.user
	if (params.id === 'new') return data
	if (!session) redirect(302, `/login?redirectTo=/design/${params.id}`);
	const savedCar = await prisma.car.findUnique({
		where: { shortId: params.id, userId: session.user.userId },
		include: carIncludeQuery,
	})
	if (savedCar) {
		data.savedCar = transformCarFromDB(savedCar)
		return data
	}
	// Car doesn't belong to logged in user, redirect to car page
	redirect(302, `/c/${params.id}`);
}) satisfies LayoutServerLoad
