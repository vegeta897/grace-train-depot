import { userIsMod } from '$lib/server/admin'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import { getLogEntries } from './log'

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) error(401)
	if (!userIsMod(locals.user)) error(403)
	const beforeId = Number(url.searchParams.get('before'))
	if (!url.searchParams.has('before') || isNaN(beforeId)) error(400)
	const logEntries = await getLogEntries({ beforeId })
	return json(logEntries)
}
