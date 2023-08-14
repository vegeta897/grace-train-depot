import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { CarData, DBCar, DecalData } from '$lib/types'
import prisma from '$lib/server/prisma'
import { generateCarShortId } from '$lib/car'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { carSchema } from '$lib/schemas'
import Car from '$lib/components/Car.svelte'
import sharp from 'sharp'
import fs from 'node:fs'

export const actions = {
	save: async (event) => {
		console.log('finish save event!')
	},
	publish: async ({ locals, params, request }) => {
		const session = await locals.auth.validate()
		if (!session) throw redirect(302, `/login?redirectTo=/design/${params.id}/finish`)
		let formCarData: any
		try {
			const formData = await request.formData()
			const carDataJSON = formData.get('carData')
			formCarData = JSON.parse(carDataJSON!.toString())
			formCarData.name = formData.get('carName')?.toString() || undefined
		} catch (e) {
			return fail(400, { invalid: true })
		}
		const parseResult = carSchema.safeParse(formCarData)
		if (!parseResult.success) {
			// TODO: Attempt to correct errors, and log the schema violation
			console.log(parseResult.error)
			return fail(400, { invalid: true })
		}
		const carData: CarData = parseResult.data
		let updatedCar: DBCar
		if (carData.shortId === 'new') {
			carData.shortId = generateCarShortId()
			updatedCar = await prisma.car.create({
				data: {
					shortId: carData.shortId,
					published: true,
					...transformCarToDB(carData),
					userId: session.user.userId,
					decals: { create: formCarData.decals.map(transformDecalToDB) },
				},
			})
		} else {
			const newDecals = carData.decals.filter((d) => d.new)
			const updatedDecals = carData.decals.filter((d) => !d.new)
			try {
				updatedCar = await prisma.car.update({
					where: { shortId: carData.shortId, userId: session.user.userId },
					data: {
						published: true,
						...transformCarToDB(carData),
						revision: { increment: 1 },
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
		try {
			// TODO: Move this to another file
			// Sharp toFile returns a promise that will not be caught here if it throws
			const { html } = (Car as any).render({ car: carData })
			const svgString = html.substring(html.indexOf('<svg'), html.indexOf('</svg>') + 6)
			sharp(Buffer.from(svgString))
				.png({ compressionLevel: 9 })
				.toFile(`./public/assets/car_${carData.shortId}_${updatedCar.revision}.png`)
			if (updatedCar.revision > 1) {
				// Delete previous revision image
				fs.rm(
					`./public/assets/car_${carData.shortId}_${updatedCar.revision - 1}.png`,
					() => {}
				)
			}
		} catch (e) {
			console.log('Error generating car image', e)
		}
		throw redirect(302, `/c/${carData.shortId}`)
	},
} satisfies Actions

function transformCarToDB(car: CarData) {
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
