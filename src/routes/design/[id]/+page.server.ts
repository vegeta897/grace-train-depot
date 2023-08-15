import prisma from '$lib/server/prisma'
import { redirect, type Actions } from '@sveltejs/kit'
import fs from 'node:fs'

export const actions = {
	delete: async ({ locals, params }) => {
		console.log('delete', params.id)
		const session = await locals.auth.validate()
		if (!session) throw redirect(302, `/login?redirectTo=/design/${params.id}`)
		const deletedCar = await prisma.car.delete({
			where: { userId: session.user.userId, shortId: params.id },
		})
		// Delete car image
		fs.rm(`./public/assets/car_${params.id}_${deletedCar.revision}.png`, () => {})
		throw redirect(302, '/?carDeleted=true')
	},
} satisfies Actions