import { transformCarFromDB } from '$lib/server/car'
import prisma from '$lib/server/prisma'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'

export const load = (async ({ params, parent }) => {
	console.log('/c/ page server load')
	const parentData = await parent()
	const carData = await prisma.car.findUniqueOrThrow({
		where: { shortId: params.id },
		include: { decals: { orderBy: { slot: 'asc' } }, toppers: true },
	})
	return {
		car: {
			...transformCarFromDB(carData),
			belongsToUser: carData.userId === parentData.user?.userId,
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
