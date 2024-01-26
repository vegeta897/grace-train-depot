import type { PageServerLoad } from './$types'
import { transformCarFromDBWithIds } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import { fail, redirect, type Actions, error } from '@sveltejs/kit'
import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'
import { getRelativeTime } from '$lib/util'
import fs from 'node:fs'
import type { SignalName } from '$lib/signals'

const carIncludeQuery = {
	decals: { orderBy: { slot: 'asc' } },
	toppers: true,
	graceTrainCarStats: true,
	user: { select: { twitchDisplayName: true } },
} as const

export const load = (async ({ params, parent }) => {
	console.log('/c/ page server load')
	const parentData = await parent()
	const carData = await prisma.car.findUnique({
		where: { shortId: params.id },
		include: carIncludeQuery,
	})
	if (!carData) error(404, 'Unknown car ID')
	const stats = carData.graceTrainCarStats
		? {
				trainCount: carData.graceTrainCarStats.graceTrainCount,
				totalAppearances: carData.graceTrainCarStats.totalAppearances,
				lastAppearance: new Date(Number(carData.graceTrainCarStats.lastGraceTrainId)),
				lastAppearanceRelative: getRelativeTime(
					new Date(Number(carData.graceTrainCarStats.lastGraceTrainId))
				),
			}
		: null
	return {
		car: {
			...transformCarFromDBWithIds(carData),
			belongsToUser: carData.userId === parentData.user?.userId,
			stats,
			twitchName: carData.user.twitchDisplayName,
			signals: carData.signals as SignalName[],
		},
	}
}) satisfies PageServerLoad

export const actions = {
	rename: async ({ locals, params, request }) => {
		const session = await locals.auth.validate()
		if (!session) redirect(302, `/login?redirectTo=/c/${params.id}`)
		const formData = await request.formData()
		const nameString = formData.get('carName')?.toString()
		if (nameString === undefined) return fail(400, { invalid: true })
		const name = nameString.substring(0, CAR_NAME_MAX_LENGTH).trim()
		await prisma.car.update({
			where: { shortId: params.id, userId: session.user.userId },
			data: { name },
		})
		return { name }
	},
	status: async ({ locals, params, request }) => {
		const session = await locals.auth.validate()
		if (!session) redirect(302, `/login?redirectTo=/c/${params.id}`)
		const formData = await request.formData()
		const status = formData.get('status')
		if (status !== 'active' && status !== 'draft') return fail(400, { invalid: true })
		const published = status === 'active'
		await prisma.car.update({
			where: { shortId: params.id, userId: session.user.userId },
			data: { published },
		})
		return { published }
	},
	delete: async ({ locals, params }) => {
		console.log('deleting car', params.id)
		const session = await locals.auth.validate()
		if (!session) redirect(302, `/login?redirectTo=/design/${params.id}`)
		// TODO: Flag for deletion instead of immediate delete
		// This will make grace train car selection a bit safer
		const deletedCar = await prisma.car.delete({
			where: { shortId: params.id, userId: session.user.userId },
		})
		// Delete car image
		fs.rm(`./public/assets/car_${params.id}.png`, () => {})
		redirect(302, '/?carDeleted=true')
	},
} satisfies Actions
