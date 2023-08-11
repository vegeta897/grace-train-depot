import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { Car, DecalData } from '$lib/types'
import prisma from '$lib/server/prisma'
import { generateCarShortId } from '$lib/car'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

// TODO: Validation on things like colors, decal count, etc

export const actions = {
	save: async (event) => {
		console.log('finish save event!')
	},
	publish: async ({ locals, params, request }) => {
		const session = await locals.auth.validate()
		if (!session) throw redirect(302, `/login?redirectTo=/design/${params.id}/finish`)
		let carData: Car
		try {
			const formData = await request.formData()
			const carDataJSON = formData.get('carData')
			carData = JSON.parse(carDataJSON!.toString())
			carData.name = formData.get('carName')?.toString()
		} catch (e) {
			return fail(400, { invalid: true })
		}
		const newCar = carData.shortId === 'new'
		if (newCar) {
			await prisma.car.create({
				data: {
					shortId: generateCarShortId(),
					published: true,
					...transformCarToDB(carData),
					userId: session.user.userId,
					decals: { create: carData.decals.map(transformDecalToDB) },
				},
			})
		} else {
			console.log('updating car')
			const newDecals = carData.decals.filter((d) => d.new)
			const updatedDecals = carData.decals.filter((d) => !d.new)
			try {
				const updatedCar = await prisma.car.update({
					where: { id: carData.id, userId: session.user.userId },
					data: {
						published: true,
						...transformCarToDB(carData),
						decals: {
							deleteMany: { NOT: updatedDecals.map(({ id }) => ({ id })) },
							update: carData.decals
								.filter((d) => !d.new)
								.map((d) => ({ where: { id: d.id }, data: transformDecalToDB(d) })),
							createMany: { data: newDecals.map(transformDecalToDB) },
						},
					},
				})
				console.log('updated car', updatedCar)
			} catch (e) {
				if (e instanceof PrismaClientKnownRequestError) {
					if (e.code === 'P2025') {
						// Likely the car ID or decal ID(s) were tampered with
					}
					console.log(e.code, e.message)
				} else {
					console.log('unknown error', e)
				}
				return fail(400, { invalid: true })
			}
		}
		throw redirect(302, '/')
	},
} satisfies Actions

function transformCarToDB(car: Car) {
	return {
		name: car.name || null,
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
