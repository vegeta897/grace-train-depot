import prisma from '$lib/server/prisma'
import { redirect, type Actions } from '@sveltejs/kit'

export const actions = {
	delete: async ({ locals, params }) => {
		console.log('delete', params.id)
		const session = await locals.auth.validate()
		if (!session) throw redirect(302, `/login?redirectTo=/design/${params.id}`)
		await prisma.car.delete({
			where: { userId: session.user.userId, shortId: params.id },
		})
		throw redirect(302, '/?carDeleted=true')
	},
} satisfies Actions
