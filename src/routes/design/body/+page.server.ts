import { updateUserCar } from '$lib/server/users'
import type { BodyName } from 'grace-train-lib'
import type { Actions } from './$types'

export const actions = {
	default: async (event) => {
		const data = await event.request.formData()
		const body = data.get('body') as BodyName
		updateUserCar('123', 0, { body })
		return { body }
	},
} satisfies Actions
