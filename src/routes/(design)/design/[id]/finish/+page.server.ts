import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { DBCar } from '$lib/types'
import type { CarData, DecalData, TopperData } from '$lib/server/schemas'
import prisma from '$lib/server/prisma'
import { generateCarShortId } from '$lib/car'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { carSchema } from '$lib/server/schemas'
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
					toppers: { create: formCarData.toppers.map(transformTopperToDB) },
				},
			})
		} else {
			// TODO: Consider removing decal/topper tables
			// Use arrays of serialized decal/topper instead
			// Then we don't have to screw with IDs, and it might be faster
			// Cons: Harder to find unused decals/toppers
			// Update: Now using a composite ID based on carId and slot
			try {
				updatedCar = await prisma.car.update({
					where: { shortId: carData.shortId, userId: session.user.userId },
					data: {
						published: true,
						...transformCarToDB(carData),
						revision: { increment: 1 },
						decals: {
							deleteMany: {},
							create: carData.decals.map(transformDecalToDB),
						},
						toppers: {
							deleteMany: {},
							create: carData.toppers.map(transformTopperToDB),
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
			// Important: Careful what css properties are used in the car SVG
			// CSS variables are NOT supported
			const svgString = html.substring(html.indexOf('<svg'), html.indexOf('</svg>') + 6)
			sharp(Buffer.from(svgString))
				.png({ compressionLevel: 9 })
				.toFile(`./public/assets/car_${carData.shortId}_${updatedCar.revision}.png`)
			if (updatedCar.revision > 1) {
				// Delete previous revision image
				// TODO: Maybe timestamp the revisions and delete them after x time instead
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
		bodyColor: car.bodyColor,
		bodyPopColor: car.bodyPopColor,
		wheelColor: car.wheels.color,
		wheelFromCenter: car.wheels.fromCenter,
	}
}

function transformDecalToDB(decal: DecalData, slot: number) {
	return {
		slot,
		x: decal.transform.x,
		y: decal.transform.y,
		scale: decal.transform.scale,
		rotate: decal.transform.rotate,
		name: decal.name,
		fill: decal.fill,
	}
}

function transformTopperToDB(topper: TopperData, slot: number) {
	return {
		slot,
		name: topper.name,
		colors: topper.colors,
		position: topper.position,
		offset: topper.offset,
		scale: topper.scale,
		rotate: topper.rotate,
	}
}
