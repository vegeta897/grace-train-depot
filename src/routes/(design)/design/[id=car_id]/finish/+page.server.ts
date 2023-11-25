import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import type { DBCar } from '$lib/types'
import type { CarData, DecalData, TopperData } from '$lib/server/schemas'
import prisma from '$lib/server/prisma'
import { generateCarShortId } from '$lib/server/car'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { carSchema } from '$lib/server/schemas'
import DesignCar from '$lib/components/DesignCar.svelte'
import sharp from 'sharp'
import fs from 'node:fs'
import { join } from 'node:path'
import { PROJECT_PATH } from '$env/static/private'

const assetsPath = join(PROJECT_PATH, './public/assets')

export const actions = {
	save: async (event) => {
		console.log('finish save action!')
	},
	publish: async ({ locals, params, request }) => {
		// TODO: Check car for flag decal in combination with certain other decals (like an X)
		// Check if X is above flag, or just flag the car as needing manual approval anyway
		// Or always put flags on top?
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
		// Parsing strips out any extra properties
		const carData: CarData = parseResult.data
		// TODO: Check for changes, return early if none detected
		const approval = session.user.trusted ? 'approved' : 'pending'
		let updatedCar: DBCar
		if (carData.shortId === 'new') {
			carData.shortId = generateCarShortId()
			updatedCar = await prisma.car.create({
				data: {
					shortId: carData.shortId,
					published: true,
					approval,
					...transformCarToDB(carData),
					userId: session.user.userId,
					decals: { create: formCarData.decals.map(transformDecalToDB) },
					toppers: { create: formCarData.toppers.map(transformTopperToDB) },
				},
			})
		} else {
			try {
				updatedCar = await prisma.car.update({
					where: { shortId: carData.shortId, userId: session.user.userId },
					data: {
						published: true,
						approval,
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
		// TODO: Move this to another file
		const { html } = (DesignCar as any).render({ car: carData })
		// Important: Careful what css properties are used in the car SVG
		// CSS variables are NOT supported
		const svgString = html.substring(html.indexOf('<svg'), html.indexOf('</svg>') + 6)
		try {
			sharp(Buffer.from(svgString))
				.png({ compressionLevel: 9 })
				.toFile(`${assetsPath}/car_${carData.shortId}_${updatedCar.revision}.png`)
				.catch((e) => console.log('Error saving car image to file', e))
			if (updatedCar.revision > 1) {
				// Delete previous revision image
				// TODO: Store revisions in a db table for easier management and cleanup
				fs.rm(
					`${assetsPath}/car_${carData.shortId}_${updatedCar.revision - 1}.png`,
					(e) => e && console.log('Error deleting previous car revision image', e)
				)
			}
		} catch (e) {
			console.log('Error generating car image PNG', e)
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
		wheelColor: car.wheelColor,
		wheelFromCenter: car.wheelFromCenter,
		wheelSize: car.wheelSize,
	}
}

function transformDecalToDB(decal: DecalData, slot: number) {
	return {
		slot,
		x: decal.x,
		y: decal.y,
		scale: decal.scale,
		rotate: decal.rotate,
		name: decal.name,
		fill: decal.fill,
		params: decal.params,
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
