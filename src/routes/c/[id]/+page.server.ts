import { transformCarFromDB } from '$lib/car'
import prisma from '$lib/server/prisma'
import { fail, redirect, type Actions } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ params }) => {
	return {
		car: transformCarFromDB(
			await prisma.car.findUniqueOrThrow({
				where: { shortId: params.id },
				include: { decals: { orderBy: { slot: 'asc' } }, toppers: true },
			})
		),
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
			data: { name },
		})
		return { success: true, name }
	},
} satisfies Actions
