import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load = (async ({ params, parent }) => {
	const { cars } = await parent()
	const car = cars?.find((c) => c.shortId === params.id)
	if (car) return { car }
	throw redirect(302, '/')
}) satisfies LayoutServerLoad
