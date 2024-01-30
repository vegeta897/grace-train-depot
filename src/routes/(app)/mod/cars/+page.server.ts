import { redirect, error } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import prisma from '$lib/server/prisma'
import type { GraceTrainCar } from 'grace-train-lib/data'
import type { $Enums, Prisma } from '@prisma/client'
import { dev } from '$app/environment'

const EIGHT_HOURS = 8 * 60 * 60 * 1000
const trainsWhereCarsQuery = { some: { car: { isNot: null } } } as const
const trainsIncludeQuery = {
	cars: {
		orderBy: { index: 'desc' },
		include: {
			car: { select: { shortId: true } },
			user: { select: { twitchDisplayName: true, trustLevel: true } },
		},
		where: { car: { isNot: null } }, // Only include designed cars
	},
} satisfies Prisma.GraceTrainInclude

export const load = (async (event) => {
	const parentData = await event.parent()
	if (!parentData.user) redirect(302, `/login?redirectTo=/mod`)
	if (!parentData.user.isMod)
		error(
			403,
			"you don't belong here, you're not a mod! ... uh, but if you are a mod, tell vegeta about this"
		)
	const trains = await prisma.graceTrain.findMany({
		where: {
			cars: trainsWhereCarsQuery, // Only include trains with at least one designed car
			id: dev ? {} : { gt: Date.now() - EIGHT_HOURS }, // Show all trains in dev mode
		},
		orderBy: { id: 'desc' },
		include: trainsIncludeQuery,
	})
	const cars: {
		car: GraceTrainCar
		carId: number
		shortId?: string
		revision: number
		username: string
		trustLevel: $Enums.TrustLevel
	}[] = []
	const addedCars = new Set<string>()
	for (const train of trains) {
		for (const car of train.cars) {
			const carIdAndRevision = `${car.carId}:${car.carRevision}`
			if (car.carId !== null && !addedCars.has(carIdAndRevision)) {
				addedCars.add(carIdAndRevision)
				cars.push({
					car: car.carData as GraceTrainCar,
					carId: car.carId,
					shortId: car.car?.shortId,
					revision: car.carRevision!,
					username: car.user!.twitchDisplayName,
					trustLevel: car.user!.trustLevel,
				})
			}
		}
	}
	return { cars }
}) satisfies PageServerLoad

export const actions = {
	// approve: (event) => changeCarApproval('approved', event),
	// flag: (event) => changeCarApproval('flagged', event),
} satisfies Actions

// async function changeCarApproval(
// 	changeTo: 'approved' | 'flagged',
// 	{ locals, request }: Parameters<Actions[string]>[0]
// ) {
// 	const session = await locals.auth.validate()
// 	if (!session) redirect(302, `/login?redirectTo=/mod`)
// 	if (!userIsMod(session.user)) return fail(403)
// 	const formData = await request.formData()
// 	const carId = +formData.get('carId')! as number
// 	const revision = +formData.get('revision')! as number
// 	const previousApproval = formData.get('approval')!.toString() as string
// 	const scope = formData.get('scope')
// 	const approval = previousApproval === changeTo ? 'pending' : changeTo
// 	console.log(
// 		'mod action!',
// 		session.user.twitchDisplayName,
// 		carId,
// 		revision,
// 		scope,
// 		previousApproval,
// 		'-->',
// 		approval
// 	)
// 	await prisma.graceTrainCar.updateMany({
// 		where: { carId, carRevision: revision },
// 		data: { approval },
// 	})
// 	try {
// 		await prisma.car.update({ where: { id: carId, revision }, data: { approval } })
// 	} catch (e) {
// 		// Car or revision no longer exists
// 		if (scope === 'car') return fail(404)
// 	}
// 	return { success: true }
// }
