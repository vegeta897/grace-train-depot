import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import prisma from '$lib/server/prisma'
import { generateCarShortId } from '$lib/server/car'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { carSchema, type CarDataForDBWrite } from '$lib/server/schemas/car'
import sharp from 'sharp'
import { join } from 'node:path'
import { PROJECT_PATH } from '$env/static/private'
import { getCarViewBox } from '$lib/car'
import { Car } from 'grace-train-lib/components'
import type { ComponentProps } from 'svelte'
import type { DecalData, TopperData } from 'grace-train-lib/data'
import { getTicketsForCar } from '$lib/tickets'

const assetsPath = join(PROJECT_PATH, './public/assets')

export const actions = {
	save: async ({ locals, params, request, fetch }) => {
		// TODO: Check car for flag decal in combination with certain other decals (like an X)
		// Check if X is above flag, or just flag the car as needing manual approval anyway
		// Or always put flags on top?
		const session = await locals.auth.validate()
		if (!session) redirect(302, `/login?redirectTo=/design/${params.id}/finish`)
		let formCarData: any
		try {
			const formData = await request.formData()
			const carDataJSON = formData.get('carData')
			formCarData = JSON.parse(carDataJSON!.toString())
			formCarData.name = formData.get('carName')?.toString()
			if (!formCarData.name) throw 'missing car name'
			formCarData.published = formData.get('draft') !== 'draft'
		} catch (e) {
			return fail(400, { invalid: true })
		}
		const parseResult = carSchema.safeParse(formCarData)
		if (!parseResult.success) {
			// TODO: Attempt to correct errors, and log the schema violation
			console.log(parseResult.error.errors)
			return fail(400, { invalid: true })
		}
		// Parsing strips out any extra properties
		const carData: CarDataForDBWrite = parseResult.data
		// TODO: Check for changes, return early if none detected
		if (carData.shortId === 'new') {
			carData.shortId = generateCarShortId()
			await prisma.car.create({
				data: {
					shortId: carData.shortId,
					...transformCarToDB(carData),
					userId: session.user.userId,
					decals: { create: carData.decals.map(transformDecalToDB) },
					toppers: { create: carData.toppers.map(transformTopperToDB) },
				},
			})
		} else {
			try {
				await prisma.car.update({
					where: { shortId: carData.shortId, userId: session.user.userId },
					data: {
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
		const { html } = (
			Car as unknown as { render: (props: ComponentProps<Car>) => { html: string } }
		).render({
			car: { depotCar: carData },
			viewBox: getCarViewBox(carData),
			width: '250px', // Good size for large image embed without being too large
			noAnimation: true, // Substitutes gifs for pngs
		})
		// Important: Careful what css properties are used in the car SVG
		// CSS variables are NOT supported

		let svgString = html.substring(html.indexOf('<svg'), html.lastIndexOf('</svg>') + 6)
		svgString = await replaceAsync(
			svgString,
			/(?<=<image .*href=")(.*?)(?=")/g,
			async (url) =>
				imageCache[url] ??
				new Promise(async (resolve) => {
					const res = await fetch(url)
					const buffer = Buffer.from(await res.arrayBuffer())
					const dataUri = `data:image/png;base64,${buffer.toString('base64')}`
					imageCache[url] = dataUri
					resolve(dataUri)
				})
		)
		try {
			sharp(Buffer.from(svgString))
				.png({ compressionLevel: 9 })
				.toFile(`${assetsPath}/car_${carData.shortId}.png`)
				.catch((e) => console.log('Error saving car image to file', e))
		} catch (e) {
			console.log('Error generating car image PNG', e)
		}
		redirect(302, `/c/${carData.shortId}`)
	},
} satisfies Actions

// Cache base64 data urls for images
const imageCache: Record<string, string> = {}

function transformCarToDB(car: CarDataForDBWrite) {
	return {
		name: car.name,
		published: car.published ?? true,
		tickets: getTicketsForCar(car),
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
		position: topper.position,
		offset: topper.offset,
		scale: topper.scale,
		rotate: topper.rotate,
		params: topper.params,
	}
}

// https://stackoverflow.com/a/73891404/2612679
async function replaceAsync(
	string: string,
	regexp: RegExp,
	replacerFunction: (v: string) => Promise<string> | string
) {
	const replacements = await Promise.all(
		Array.from(string.matchAll(regexp), (match) => replacerFunction(match[1]))
	)
	let i = 0
	return string.replace(regexp, () => replacements[i++])
}
