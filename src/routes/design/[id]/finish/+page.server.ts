import { error, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { Car, DecalData } from '$lib/types'
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
		if (newCar) {
			await prisma.car.create({
				data: {
					shortId: generateCarShortId(),
					...transformCarToDB(carData),
					userId: session.user.userId,
					decals: { create: carData.decals.map(transformDecalToDB) },
				},
			})
		} else {
			console.log('updating car')
			await prisma.car.update({
				where: { id: carData.id, userId: session.user.userId },
				data: {
					...transformCarToDB(carData),
					userId: session.user.userId,
					decals: {
						deleteMany: {
							carId: carData.id,
							NOT: carData.decals.filter((d) => !d.new).map(({ id }) => ({ id })),
						},
						update: carData.decals
							.filter((d) => !d.new)
							.map((d) => ({
								where: { id: d.id },
								data: transformDecalToDB(d),
							})),
						create: carData.decals.filter((d) => d.new).map(transformDecalToDB),
					},
				},
			})
		}
		throw redirect(302, '/')
	},
} satisfies Actions

function transformCarToDB(car: Car) {
	return {
		body: car.body,
		wheelColor: car.wheels.color,
		wheelFromCenter: car.wheels.fromCenter,
		hatColor: car.hat.color,
	}
}

function transformDecalToDB(decal: DecalData) {
	return {
		x: decal.transform.x,
		y: decal.transform.y,
		scale: decal.transform.scale,
		rotate: decal.transform.rotate,
		slot: decal.slot,
		name: decal.name,
		fill: decal.fill,
	}
}
