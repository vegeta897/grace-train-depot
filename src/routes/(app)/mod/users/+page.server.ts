import { redirect, error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import prisma from '$lib/server/prisma'
import type { GraceTrainCar } from 'grace-train-lib/trains'
import { dev } from '$app/environment'

const EIGHT_HOURS = 8 * 60 * 60 * 1000

export const load = (async (event) => {
	const parentData = await event.parent()
	if (!parentData.user) redirect(302, `/login?redirectTo=/mod`)
	if (!parentData.user.isMod)
		error(
			403,
			"you don't belong here, you're not a mod! ... uh, but if you are a mod, tell vegeta about this"
		)
	const users = await prisma.user.findMany({
		select: {
			id: true,
			twitchDisplayName: true,
			trustLevel: true,
			graceTrainCars: {
				select: { carId: true, carRevision: true, carData: true },
				where: {
					trainId: dev ? {} : { gt: Date.now() - EIGHT_HOURS }, // Show all trains in dev mode
					carId: { not: null }, // Only include designed cars
				},
				distinct: ['carId', 'carRevision'],
				orderBy: [{ trainId: 'desc' }, { index: 'desc' }],
			},
		},
		orderBy: { graceTrainCars: { _count: 'desc' } },
		where: {
			//trustLevel: { in: ['default', 'flagged'] },
		},
	})
	return {
		users: users.map((user) => ({
			...user,
			graceTrainCars: user.graceTrainCars.map((gtCar) => ({
				...gtCar,
				carData: gtCar.carData as GraceTrainCar,
			})),
		})),
	}
}) satisfies PageServerLoad

export const actions = {} satisfies Actions
