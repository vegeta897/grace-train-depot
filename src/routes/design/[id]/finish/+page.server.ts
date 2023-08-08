import { error, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { Car } from '$lib/types'
import prisma from '$lib/server/prisma'
import { generateCarShortId } from '$lib/car'

export const actions = {
	save: async (event) => {
		console.log('finish save event!')
	},
	publish: async (event) => {
		const session = await event.locals.auth.validate()
		if (!session) throw error(401, 'You are not logged in')
		const carDataJSON = (await event.request.formData()).get('carData')
		if (!carDataJSON) throw error(400, 'missing form data')
		let carData: Car
		try {
			carData = JSON.parse(carDataJSON.toString())
		} catch (e) {
			throw error(400, 'bad form data')
		}
		const newCar = carData.shortId === 'new'
		await prisma.car.create({
			data: {
				shortId: newCar ? generateCarShortId() : carData.shortId,
				body: carData.body,
				wheelColor: carData.wheels.color,
				wheelFromCenter: carData.wheels.fromCenter,
				hatColor: carData.hat.color,
				userId: session.user.userId,
				decals: {
					create: carData.decals.map((d) => ({
						x: d.transform.x,
						y: d.transform.y,
						scale: d.transform.scale,
						rotate: d.transform.rotate,
						slot: d.slot,
						name: d.name,
						fill: d.fill,
					})),
				},
			},
		})
		throw redirect(302, '/')
	},
} satisfies Actions
