import { error, redirect, type Actions, fail } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import prisma from '$lib/server/prisma'
import { getRelativeTime } from '$lib/util'
import type { $Enums } from 'grace-train-lib/prisma'
import { userIsAdmin, userIsMod } from '$lib/server/admin'
import { getLogEntries } from '../../log/log'
import { hideUserFromOverlay } from '../../mod'

const pageUserIncludeQuery = {
	_count: { select: { cars: true } },
	cars: { select: { updatedAt: true }, orderBy: { updatedAt: 'desc' }, take: 1 },
} as const

export const load = (async ({ params, parent }) => {
	const parentData = await parent()
	// TODO: Do this in /mod/+layout.server.ts
	if (!parentData.user) redirect(302, `/login?redirectTo=/mod`)
	if (!parentData.user.isMod)
		error(
			403,
			"you don't belong here, you're not a mod! ... uh, but if you are a mod, tell vegeta about this"
		)
	const pageUser = await prisma.user.findUnique({
		where: { id: params.id },
		include: pageUserIncludeQuery,
	})
	if (!pageUser) error(404, 'user not found')
	const lastActive = pageUser.cars[0]
		? new Date(Number(pageUser.cars[0].updatedAt))
		: null
	const logEntries = await getLogEntries({
		where: { OR: [{ modId: params.id }, { onUserId: params.id }] },
	})
	return {
		pageUser: {
			twitchUsername: pageUser.twitchUsername,
			twitchDisplayName: pageUser.twitchDisplayName,
			trustLevel: pageUser.trustLevel,
			createdAt: pageUser.createdAt,
			carCount: pageUser._count.cars,
			createdAtRelative: getRelativeTime(pageUser.createdAt),
			lastActive,
			lastActiveRelative: lastActive ? getRelativeTime(lastActive) : null,
		},
		logEntries,
	}
}) satisfies PageServerLoad

const trustLevels: $Enums.TrustLevel[] = ['trusted', 'default', 'hidden', 'banned']

export const actions = {
	setUserLevel: async ({ locals, params, request }) => {
		const session = await locals.auth.validate()
		if (!session) redirect(302, `/login?redirectTo=/mod/user/${params.id}`)
		if (!userIsMod(session.user)) return fail(403)
		const formData = await request.formData()
		const trustLevel = formData.get('trustLevel')?.toString() as $Enums.TrustLevel
		if (!params.id || !trustLevels.includes(trustLevel))
			return fail(400, { invalid: true })
		// Don't allow non-admins to modify other mods
		if (userIsMod(params.id) && !userIsAdmin(session.user)) return fail(403)
		const user = await prisma.user.update({
			where: { id: params.id },
			data: { trustLevel },
		})
		if (trustLevel === 'banned' || trustLevel === 'hidden')
			hideUserFromOverlay(user.twitchUserId)
		prisma.auditLog
			.create({
				data: {
					modId: session.user.userId,
					onUserId: params.id,
					action: 'changeUserLevel',
					data: trustLevel,
				},
			})
			.then(/* prisma queries must be awaited */)
		return { trustLevel }
	},
} satisfies Actions
