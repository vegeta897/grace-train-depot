import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import type { Car } from '$lib/types'
import { COLORS } from 'grace-train-lib'

export const load = (async ({ params, parent }) => {
	if (params.id === 'local') {
		return {
			car: {
				id: 0,
				shortId: 'local',
				body: 'boxy',
				decals: [],
				wheels: { color: COLORS.POP, fromCenter: 100 },
				hat: { color: null },
			} as Car,
		}
	}
	const { cars } = await parent()
	const car = cars?.find((c) => c.shortId === params.id)
	if (car) return { car }
	throw redirect(302, '/')
}) satisfies LayoutServerLoad
