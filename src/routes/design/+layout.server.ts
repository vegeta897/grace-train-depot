import { UsersDB } from '$lib/server/users'
import type { LayoutServerLoad } from './$types'

export const load = (async () => {
	return {
		car: UsersDB.data.users[0].cars[0],
	}
}) satisfies LayoutServerLoad
