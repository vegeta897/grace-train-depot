import type { LayoutServerLoad } from './$types'

export const load = (async (event) => {
	const session = await event.locals.auth.validate()
	console.log('root layout load')
	// TODO: Move session or user property to locals in hooks file
	// TODO: Stream non-essential data https://svelte.dev/blog/streaming-snapshots-sveltekit
	if (session) {
		return {
			user: session.user,
		}
	}
}) satisfies LayoutServerLoad
