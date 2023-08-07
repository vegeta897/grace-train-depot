import { invalidateAll } from '$app/navigation'
import type { Car, DecalData } from '$lib/types'
import { Prisma } from '@prisma/client'
import { cloneDecal } from './decal'
import { COLORS } from 'grace-train-lib'

const carWithDecals = Prisma.validator<Prisma.CarDefaultArgs>()({
	include: { decals: true },
})
type CarWithDecals = Prisma.CarGetPayload<typeof carWithDecals>

export async function updateCar(carId: number, carData: Partial<Car>) {
	const updateResponse = await fetch('/api/car', {
		method: 'PUT',
		body: JSON.stringify({ carId, carData }),
		headers: { 'content-type': 'application/json' },
	})
	invalidateAll()
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
		decals: carData.decals.map((decal) => ({
			transform: {
				x: decal.x,
				y: decal.y,
				rotate: decal.rotate,
				scale: decal.scale,
			},
			slot: decal.slot,
			id: decal.id,
			name: decal.name as DecalData['name'],
			fill: decal.fill,
		})),
	}
}

export function cloneCar(car: Car): Car {
	return {
		...car,
		wheels: {
			...car.wheels,
		},
		hat: { ...car.hat },
		decals: car.decals.map(cloneDecal),
	}
}

export function getNewCar(): Car {
	return {
		id: 0,
		shortId: 'new',
		body: 'boxy',
		decals: [],
		wheels: { color: COLORS.POP, fromCenter: 100 },
		hat: { color: null },
	}
}
