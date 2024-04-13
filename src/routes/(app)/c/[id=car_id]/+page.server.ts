import type { PageServerLoad } from './$types'
import { transformCarFromDBWithIds } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import { fail, redirect, type Actions, error } from '@sveltejs/kit'
import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'
import { getRelativeTime } from '$lib/util'
import fs from 'node:fs'
import type { Prisma } from '@prisma/client'

const carIncludeQuery = {
	decals: { orderBy: { slot: 'asc' } },
	toppers: { orderBy: { slot: 'asc' } },
	graceTrainCarStats: true,
	user: { select: { twitchDisplayName: true } },
} satisfies Prisma.CarInclude

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
		},
	}
}) satisfies PageServerLoad

export const actions = {
	rename: async ({ locals, params, request }) => {
		if (!locals.user) redirect(302, `/login?redirectTo=/c/${params.id}`)
		const formData = await request.formData()
		const nameString = formData.get('carName')?.toString()
		if (nameString === undefined) return fail(400, { invalid: true })
		const name = nameString.substring(0, CAR_NAME_MAX_LENGTH).trim()
		await prisma.car.update({
			where: { shortId: params.id, userId: locals.user.id },
			data: { name },
		})
		return { name }
	},
	delete: async ({ locals, params }) => {
		console.log('deleting car', params.id)
		if (!locals.user) redirect(302, `/login?redirectTo=/design/${params.id}`)
		// TODO: Flag for deletion instead of immediate delete
		// This will make grace train car selection a bit safer
		const deletedCar = await prisma.car.delete({
			where: { shortId: params.id, userId: locals.user.id },
		})
		// Delete car image
		fs.rm(`./public/assets/car_${params.id}.png`, () => {})
		redirect(302, '/')
	},
} satisfies Actions
