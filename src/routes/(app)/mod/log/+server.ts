import { userIsMod } from '$lib/server/admin'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { getLogEntries } from './log'

export const GET: RequestHandler = async ({ locals, url }) => {
	const session = await locals.auth.validate()
	if (!session) error(401)
	if (!userIsMod(session.user)) error(403)
	const beforeId = Number(url.searchParams.get('before'))
	if (!url.searchParams.has('before') || isNaN(beforeId)) error(400)
	const logEntries = await getLogEntries({ beforeId })
	return json(logEntries)
}
