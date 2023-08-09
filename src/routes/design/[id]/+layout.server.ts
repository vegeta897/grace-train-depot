import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load = (async ({ params, parent }) => {
	console.log('design layout server load')
	if (params.id === 'new') return { designShortId: 'new' }
	const { savedCars } = await parent()
	const savedCar = savedCars?.find((c) => c.shortId === params.id)
	if (savedCar) return { savedCar, designShortId: savedCar.shortId }
	throw redirect(302, '/')
}) satisfies LayoutServerLoad
