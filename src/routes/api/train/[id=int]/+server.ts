import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { userIsMod } from '$lib/server/admin'
import prisma from '$lib/server/prisma'
import type { ModPageTrainCar } from '../../../(app)/mod/Train.svelte'

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const session = await locals.auth.validate()
	if (!session) error(401)
	if (!userIsMod(session.user)) error(403)
	const id = Number(params.id)
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
			user: { select: { twitchUsername: true, twitchDisplayName: true } },
		},
		orderBy: { index: 'desc' },
		where: {
			trainId: id,
			index: { gt: afterIndex },
			carId: { not: null }, // Only include designed cars
			user: { isNot: null }, // Don't include deleted users
		},
	})
	return json({
		ended: train.ended,
		newCars: newCars.map((car) => ({
			...car,
			carData: car.carData as ModPageTrainCar['carData'],
			addedAt: car.addedAt.getTime(), // Because we can't use sveltekit's serializer
		})) as (Omit<ModPageTrainCar, 'addedAt'> & { addedAt: number })[],
	})
}
