import type { LayoutServerLoad } from './$types'

export const load = (async (event) => {
	const validated = await event.locals.auth.validate()
	if (validated) {
		return {
			user: validated.user,
		}
	}
	return {}
}) satisfies LayoutServerLoad
