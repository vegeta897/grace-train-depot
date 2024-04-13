import { getUserCars } from '$lib/server/user'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ parent }) => {
	const parentData = await parent()
	if (!parentData.user) redirect(302, '/')
	const cars = await getUserCars(parentData.user.userId)
	if (cars.length === 0) redirect(302, '/design/new')
	return { cars }
}) satisfies PageServerLoad
