import { userIsMod } from '$lib/server/admin'
import { redirect, error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { AUDIT_LOG_PAGE_SIZE, getLogEntries } from './log'

export const load = (async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) redirect(302, '/login?redirectTo=/mod')
	if (!userIsMod(session.user))
		error(
			403,
			"you don't belong here, you're not a mod! ... but if you want to be one, ask vegeta!"
		)
	const logEntries = await getLogEntries()
	return {
		logEntries,
		lastId: logEntries.length >= AUDIT_LOG_PAGE_SIZE ? logEntries.at(-1)!.id : undefined,
	}
}) satisfies PageServerLoad
