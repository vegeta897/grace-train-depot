import { userIsMod } from '$lib/server/admin'
import type { LayoutServerLoad } from './$types'

export const load = (async (event) => {
	// console.log('root layout load')
	// TODO: Stream non-essential data https://svelte.dev/blog/streaming-snapshots-sveltekit
	if (event.locals.user)
		return {
			user: {
				userId: event.locals.user.id,
				twitchDisplayName: event.locals.user.twitchDisplayName,
				trustLevel: event.locals.user.trustLevel,
				isMod: userIsMod(event.locals.user),
			},
		}
}) satisfies LayoutServerLoad
