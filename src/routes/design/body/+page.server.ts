import type { BodyName } from 'grace-train-lib'
import type { Actions } from './$types'
import prisma from '$lib/server/prisma'

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
