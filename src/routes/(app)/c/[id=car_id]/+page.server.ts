import type { PageServerLoad } from './$types'
import { transformCarFromDB } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import { fail, redirect, type Actions, error } from '@sveltejs/kit'
import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'

export const load = (async ({ params, parent }) => {
	console.log('/c/ page server load')
	const parentData = await parent()
	const carData = await prisma.car.findUnique({
		where: { shortId: params.id },
		include: {
			decals: { orderBy: { slot: 'asc' } },
			toppers: true,
			graceTrainCarStats: true,
		},
	})
	if (!carData) throw error(404, 'Unknown car ID')
	return {
		car: {
			...transformCarFromDB(carData),
			belongsToUser: carData.userId === parentData.user?.userId,
			trainCount: carData.graceTrainCarStats?.graceTrainCount,
			totalAppearances: carData.graceTrainCarStats?.totalAppearances,
			lastAppeared: Number(carData.graceTrainCarStats?.lastGraceTrainId ?? 0),
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
} satisfies Actions
