import { userIsMod } from '$lib/server/admin'
import type { LayoutServerLoad } from './$types'

export const load = (async (event) => {
	const session = await event.locals.auth.validate()
	console.log('root layout load')
	// TODO: Move session or user property to locals in hooks file
	// Or https://twitter.com/pilcrowonpaper/status/1707734991990571480
	// TODO: Stream non-essential data https://svelte.dev/blog/streaming-snapshots-sveltekit
	if (session) {
		return { user: { ...session.user, isMod: userIsMod(session.user) } }
	}
}) satisfies LayoutServerLoad
