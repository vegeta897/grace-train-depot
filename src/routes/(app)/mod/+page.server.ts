import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import prisma from '$lib/server/prisma'
import type { GraceTrainCar } from 'grace-train-lib/trains'
import type { $Enums } from '@prisma/client'
import { userIsMod } from '$lib/server/admin'
import { dev } from '$app/environment'

const EIGHT_HOURS = 8 * 60 * 60 * 1000

export const load = (async (event) => {
	const parentData = await event.parent()
	if (!parentData.user) throw redirect(302, `/login?redirectTo=/mod`)
	if (!parentData.user.isMod) return fail(403)
	const trains = await prisma.graceTrain.findMany({
		where: {
			cars: { some: { carId: { gte: 0 } } }, // Only include trains with at least one designed car
			id: dev ? {} : { gt: Date.now() - EIGHT_HOURS }, // Show all trains in dev mode
		},
		orderBy: { id: 'desc' },
		include: {
			cars: { orderBy: { index: 'desc' }, include: { car: true, user: true } },
		},
	})
	const cars: {
		car: GraceTrainCar
		carId: number
		shortId?: string
		revision: number
		approval: $Enums.Approval
		username: string
		trusted: boolean
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
					approval: car.approval!,
					username: car.user!.twitchDisplayName,
					trusted: car.user!.trusted,
				})
			}
		}
	}
	return { cars }
}) satisfies PageServerLoad

export const actions = {
	approve: (event) => changeCarApproval('approved', event),
	reject: (event) => changeCarApproval('rejected', event),
} satisfies Actions

async function changeCarApproval(
	changeTo: 'approved' | 'rejected',
	{ locals, request }: Parameters<Actions[string]>[0]
) {
	const session = await locals.auth.validate()
	if (!session) throw redirect(302, `/login?redirectTo=/mod`)
	if (!userIsMod(session.user)) return fail(403)
	const formData = await request.formData()
	const carId = +formData.get('carId')! as number
	const revision = +formData.get('revision')! as number
	const previousApproval = formData.get('approval')!.toString() as string
	const scope = formData.get('scope')
	console.log(
		'mod action!',
		session.user.twitchDisplayName,
		carId,
		revision,
		scope,
		previousApproval,
		'-->',
		changeTo
	)
	const approval = previousApproval === changeTo ? 'pending' : changeTo
	await prisma.graceTrainCar.updateMany({
		where: { carId, carRevision: revision },
		data: { approval },
	})
	try {
		await prisma.car.update({ where: { id: carId, revision }, data: { approval } })
	} catch (e) {
		// Car or revision no longer exists
		if (scope === 'car') return fail(404)
	}
	return { success: true }
}
