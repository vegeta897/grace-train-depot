import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma, { orderBySlot } from '$lib/server/prisma'
import { transformCarFromDBToGraceTrainCar } from '$lib/car'
import type { Prisma } from '@prisma/client'

export const POST = (async ({ request }) => {
	console.log('/api/train/add POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) throw error(401)
	const { trainId, grace, index, score } = (await request.json()) as {
		trainId: number
		grace: { userId: string; color: string }
		index: number // In case requests arrive out of order
		score: number
	}
	const train = await prisma.graceTrain.update({
		data: { score },
		where: { id: trainId },
	})
	if (!train) throw error(400, 'Unknown train ID')
	const graceTrainCarCreate: Prisma.GraceTrainCarCreateInput = {
		train: { connect: { id: trainId } },
		index,
		twitchUserId: grace.userId,
		carData: grace.color,
	}
	const user = await prisma.user.findUnique({
		where: { twitchUserId: grace.userId },
		include: {
			cars: { include: { decals: orderBySlot, toppers: orderBySlot } },
		},
	})
	if (user && user.cars.length > 0) {
		graceTrainCarCreate.user = { connect: { id: user.id } }
		// TODO: Car picking logic
		graceTrainCarCreate.carData = transformCarFromDBToGraceTrainCar(user.cars[0])
	}
	prisma.graceTrainCar.create({
		data: graceTrainCarCreate,
	})
	return json(graceTrainCarCreate.carData)
}) satisfies RequestHandler
