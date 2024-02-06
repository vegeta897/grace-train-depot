import { error, redirect, type Actions, fail } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { userIsAdmin, userIsMod } from '$lib/server/admin'
import prisma from '$lib/server/prisma'
import type { GraceTrainCar } from 'grace-train-lib/data'
import { dev } from '$app/environment'
import { hideUserFromOverlay } from './mod'
import type { Prisma } from '@prisma/client'

const EIGHT_HOURS = 8 * 60 * 60 * 1000
const CARS_LIMIT = 50

const moddableCarsQuery = {
	user: { isNot: null },
	hasDecals: true,
} satisfies Prisma.GraceTrainCarWhereInput
const trainSelectQuery = {
	id: true,
	ended: true,
	_count: { select: { cars: { where: moddableCarsQuery } } },
	cars: {
		take: CARS_LIMIT,
		orderBy: { index: 'desc' },
		select: {
			index: true,
			addedAt: true,
			carData: true,
			user: {
				select: {
					twitchUsername: true,
					twitchDisplayName: true,
					id: true,
					trustLevel: true,
				},
			},
			car: { select: { shortId: true } },
		},
		where: moddableCarsQuery,
	},
} satisfies Prisma.GraceTrainSelect

export const load = (async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) redirect(302, '/login?redirectTo=/mod')
	if (!userIsMod(session.user))
		error(
			403,
			"you don't belong here, you're not a mod! ... but if you want to be one, ask vegeta!"
		)
	const trains = await prisma.graceTrain.findMany({
		select: trainSelectQuery,
		take: 8,
		where: {
			cars: { some: moddableCarsQuery },
			id: dev ? {} : { gt: Date.now() - EIGHT_HOURS },
		},
		orderBy: { id: 'desc' },
	})
	return {
		admin: userIsAdmin(session.user),
		trains: trains.map((train) => ({
			id: Number(train.id),
			ended: train.ended,
			truncatedCars: Math.max(0, train._count.cars - CARS_LIMIT),
			cars: train.cars.map((car) => ({
				...car,
				carData: car.carData as GraceTrainCar,
				addedAt: car.addedAt.getTime(), // To match api/train/[id] GET data
				hidden:
					!car.user ||
					car.user.trustLevel === 'hidden' ||
					car.user.trustLevel === 'banned',
			})),
		})),
	}
}) satisfies PageServerLoad

export const actions = {
	hideUser: async ({ locals, request }) => {
		const session = await locals.auth.validate()
		if (!session) redirect(302, `/login?redirectTo=/mod`)
		if (!userIsMod(session.user)) return fail(403)
		const formData = await request.formData()
		const userId = formData.get('userId')?.toString()
		if (!userId) return fail(400, { invalidUser: true, notAllowed: false })
		// Don't allow non-admins to hide other mods
		if (userIsMod(userId) && !userIsAdmin(session.user))
			return fail(403, { invalidUser: false, notAllowed: true })
		try {
			const user = await prisma.user.update({
				select: { trustLevel: true, twitchUserId: true },
				where: { id: userId, trustLevel: { not: 'banned' } },
				data: { trustLevel: 'hidden' },
			})
			hideUserFromOverlay(user.twitchUserId)
			prisma.auditLog
				.create({
					data: {
						modId: session.user.userId,
						onUserId: userId,
						action: 'changeUserLevel',
						data: 'hidden',
					},
				})
				.then(/* prisma queries must be awaited */)
			return { trustLevel: user.trustLevel }
		} catch (e) {
			return fail(404, { invalidUser: true, notAllowed: false })
		}
	},
} satisfies Actions
