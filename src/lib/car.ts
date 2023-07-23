import type { Car, DecalData } from '$lib/types'
import { Prisma } from '@prisma/client'

const carWithDecals = Prisma.validator<Prisma.CarArgs>()({
	include: { decals: true },
})
type CarWithDecals = Prisma.CarGetPayload<typeof carWithDecals>

export async function updateCar(id: number, data: Partial<Car>) {
	console.log('queuing update')
	const updateResponse = await fetch('/api/car', {
		method: 'POST',
		body: JSON.stringify({ id, data }),
		headers: { 'content-type': 'application/json' },
	})
	console.log('posted,', await updateResponse.json())
}

export function transformCarFromDB(carData: CarWithDecals): Car {
	return {
		id: carData.id,
		shortId: carData.shortId,
		body: carData.body as Car['body'],
		wheels: {
			color: carData.wheelColor,
			fromCenter: carData.wheelFromCenter,
		},
		hat: { color: carData.hatColor },
		decals: carData.decals.map(
			(decal) =>
				({
					transform: {
						translate: { x: decal.x, y: decal.y },
						rotate: decal.rotate,
						scale: decal.scale,
					},
					id: decal.id,
					name: decal.name,
					fill: decal.fill,
				} as DecalData)
		),
	}
}
