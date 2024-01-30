import { DEPOT_SECRET } from '$env/static/private'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma from '$lib/server/prisma'
import type { DepotTrainEndRequest } from 'grace-train-lib/data'

export const POST = (async ({ request }) => {
	console.log('/api/train/end POST received!')
	const authHeader = request.headers.get('Authorization')
	if (authHeader !== DEPOT_SECRET) error(401)
	const { trainId, score } = (await request.json()) as DepotTrainEndRequest
	try {
		await prisma.graceTrain.update({
			where: { id: trainId },
			data: { score, ended: true },
		})
	} catch (e) {
		// Update throws here if train record not found
		console.log('Error ending train ID', trainId, e)
	}
	// Get a list of cars that debuted in this train
	const carDebutCount = await prisma.graceTrainCarStats.count({
		where: { lastGraceTrainId: trainId, graceTrainCount: 1 },
	})
	return json({ carDebutCount })
}) satisfies RequestHandler
