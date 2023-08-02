import type { DecalData } from '$lib/types'
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import prisma from '$lib/server/prisma'

export const POST = (async ({ request, locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw error(401, 'You are not logged in')
	const reqJson: { carId: number; decalData: DecalData } = await request.json()
	console.log('/api/car/decal POST received for car ID', reqJson.carId)
	const { carId, decalData } = reqJson
	const dbCarAndDecals = await prisma.car.findUnique({
		where: { id: carId },
		include: { decals: { select: { id: true } } },
	})
	if (!dbCarAndDecals) throw error(404, 'Unknown car')
	if (dbCarAndDecals.decals.length >= 5) throw error(403, 'Decal limit reached')
	const decalDBdata = transformDecalToDB(decalData)
	const createdDecal = await prisma.decal.create({
		data: { ...decalDBdata, slot: 0, car: { connect: { id: carId } } },
	})
	return json({ success: true, decalId: createdDecal.id })
}) satisfies RequestHandler

export const PUT = (async ({ request, locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw error(401, 'You are not logged in')
	const reqJson: { carId: number; decalId: number; decalData: DecalData } =
		await request.json()
	console.log('/api/car/decal PUT received for decal ID', reqJson.decalId)
	const { carId, decalId, decalData } = reqJson
	const dbCarAndDecals = await prisma.car.findUnique({
		where: { id: carId },
		include: { decals: { select: { id: true } } },
	})
	if (!dbCarAndDecals) throw error(404, 'Unknown car')
	const existingDecal = dbCarAndDecals.decals.find((d) => d.id === decalId)
	if (!existingDecal) throw error(404, 'Unknown decal')
	const decalDBdata = transformDecalToDB(decalData)
	await prisma.decal.update({ where: { id: decalId }, data: decalDBdata })
	return json({ success: true })
}) satisfies RequestHandler

export const DELETE = (async ({ request, locals }) => {
	const session = await locals.auth.validate()
	if (!session) throw error(401, 'You are not logged in')
	const reqJson: { carId: number; decalId: number } = await request.json()
	console.log('/api/car/decal DELETE received for decal ID', reqJson.decalId)
	const { carId, decalId } = reqJson
	const dbCarAndDecals = await prisma.car.findUnique({
		where: { id: carId },
		include: { decals: { select: { id: true } } },
	})
	if (!dbCarAndDecals) throw error(404, 'Unknown car')
	const existingDecal = dbCarAndDecals.decals.find((d) => d.id === decalId)
	if (!existingDecal) throw error(404, 'Unknown decal')
	await prisma.decal.delete({ where: { id: decalId } })
	return json({ success: true })
}) satisfies RequestHandler

function transformDecalToDB(decal: DecalData) {
	return { name: decal.name, fill: decal.fill, ...decal.transform }
}
