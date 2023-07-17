import type { BodyName } from 'grace-train-lib'
import prisma from '$lib/server/prisma'
import type { Actions } from '@sveltejs/kit'

export const actions = {
	default: async (event) => {
		const data = await event.request.formData()
		const body = data.get('body') as BodyName
		await prisma.car.update({
			where: { id: 1 },
			data: { body },
		})
		return { body }
	},
} satisfies Actions
