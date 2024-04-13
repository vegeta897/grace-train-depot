import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { userIsMod } from '$lib/server/admin'
import prisma from '$lib/server/prisma'
import type { ModPageTrainCar } from './Train.svelte'

// TODO: Move this into mod folder
// Share query/functions with page.server.ts

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) error(401)
	if (!userIsMod(locals.user)) error(403)
	const id = Number(url.searchParams.get('id'))
	const afterIndex = Number(url.searchParams.get('afterIndex'))
	// Empty search param results in 0 afterIndex
	if (!url.searchParams.has('afterIndex') || isNaN(afterIndex)) error(400)
	const train = await prisma.graceTrain.findUnique({
		select: { ended: true },
		where: { id },
	})
	if (!train) error(404)
	const newCars = await prisma.graceTrainCar.findMany({
		select: {
			index: true,
			addedAt: true,
			carData: true,
			user: {
				select: {
					twitchUsername: true,
					twitchDisplayName: true,
					id: true,
					trustLevel: true,
				},
			},
			car: { select: { shortId: true } },
		},
		orderBy: { index: 'desc' },
		where: {
			trainId: id,
			index: { gt: afterIndex },
			hasDecals: true, // Only include cars with decals
			user: { isNot: null }, // Don't include deleted users
		},
	})
	return json({
		ended: train.ended,
		newCars: newCars.map((car) => ({
			...car,
			carData: car.carData as ModPageTrainCar['carData'],
			addedAt: car.addedAt.getTime(), // Because we can't use sveltekit's serializer
			hidden:
				!car.user || car.user.trustLevel === 'hidden' || car.user.trustLevel === 'banned',
		})) as (Omit<ModPageTrainCar, 'addedAt'> & { addedAt: number })[],
	})
}
