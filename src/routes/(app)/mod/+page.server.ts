import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { userIsMod } from '$lib/server/admin'
import prisma from '$lib/server/prisma'
import type { GraceTrainCar } from 'grace-train-lib/trains'
import { dev } from '$app/environment'

const EIGHT_HOURS = 8 * 60 * 60 * 1000

export const load = (async ({ locals }) => {
	const session = await locals.auth.validate()
	if (!session) redirect(302, '/login?redirectTo=/mod')
	if (!userIsMod(session.user))
		error(
			403,
			"you don't belong here, you're not a mod! ... but if you want to be one, ask vegeta!"
		)
	const trains = await prisma.graceTrain.findMany({
		select: {
			id: true,
			ended: true,
			cars: {
				orderBy: { index: 'desc' },
				select: {
					index: true,
					addedAt: true,
					carData: true,
					user: { select: { twitchUsername: true, twitchDisplayName: true } },
				},
				where: {
					carId: { not: null }, // Only include designed cars
					user: { isNot: null }, // Don't include deleted users
				},
			},
		},
		where: {
			cars: { some: { user: { isNot: null } } }, // Has at least one designed car
			id: dev ? {} : { gt: Date.now() - EIGHT_HOURS },
		},
		orderBy: { id: 'desc' },
	})
	return {
		trains: trains.map((train) => ({
			id: Number(train.id),
			ended: train.ended,
			cars: train.cars.map((car) => ({
				...car,
				carData: car.carData as GraceTrainCar,
			})),
		})),
	}
}) satisfies PageServerLoad
