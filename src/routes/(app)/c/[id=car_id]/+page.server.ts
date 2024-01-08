import type { PageServerLoad } from './$types'
import { transformCarFromDB } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import { fail, redirect, type Actions, error } from '@sveltejs/kit'
import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'
import { getRelativeTime } from '$lib/util'
import fs from 'node:fs'

export const load = (async ({ params, parent }) => {
	console.log('/c/ page server load')
	const parentData = await parent()
	const carData = await prisma.car.findUnique({
		where: { shortId: params.id },
		include: {
			decals: { orderBy: { slot: 'asc' } },
			toppers: true,
			graceTrainCarStats: true,
			user: { select: { twitchDisplayName: true } },
		},
	})
	if (!carData) throw error(404, 'Unknown car ID')
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
			...transformCarFromDB(carData),
			belongsToUser: carData.userId === parentData.user?.userId,
			stats,
			twitchName: carData.user.twitchDisplayName,
		},
	}
}) satisfies PageServerLoad

export const actions = {
	rename: async ({ locals, params, request }) => {
		const session = await locals.auth.validate()
		if (!session) throw redirect(302, `/login?redirectTo=/c/${params.id}`)
		const formData = await request.formData()
		const name = formData.get('carName')?.toString()
		if (name === undefined) return fail(400, { invalid: true })
		await prisma.car.update({
			where: { shortId: params.id, userId: session.user.userId },
			data: { name: name.substring(0, CAR_NAME_MAX_LENGTH).trim() },
		})
		return { success: true, name }
	},
	delete: async ({ locals, params }) => {
		console.log('deleting car', params.id)
		const session = await locals.auth.validate()
		if (!session) throw redirect(302, `/login?redirectTo=/design/${params.id}`)
		// TODO: Flag for deletion instead of immediate delete
		// This will make grace train car selection a bit safer
		const deletedCar = await prisma.car.delete({
			where: { userId: session.user.userId, shortId: params.id },
		})
		// Delete car image
		fs.rm(`./public/assets/car_${params.id}.png`, () => {})
		throw redirect(302, '/?carDeleted=true')
	},
} satisfies Actions
