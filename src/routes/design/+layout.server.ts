import prisma from '$lib/server/prisma'
import type { Car, DecalData } from '$lib/types'
import type { LayoutServerLoad } from './$types'

export const load = (async () => {
	const carData = await prisma.car.findUniqueOrThrow({
		where: {
			id: 1,
		},
		include: { decals: true },
	})
	const car: Car = {
		body: carData.body as Car['body'],
		wheels: {
			color: carData.wheelColor,
			fromCenter: carData.wheelFromCenter.toNumber(),
		},
		hat: { color: carData.hatColor },
		decals: carData.decals.map(
			(decal) =>
				({
					transform: {
						translate: { x: decal.x.toNumber(), y: decal.y.toNumber() },
						rotate: decal.rotate.toNumber(),
						scale: decal.scale.toNumber(),
					},
					id: decal.id,
					name: decal.name,
					fill: decal.fill,
				} as DecalData)
		),
	}
	return {
		car,
	}
}) satisfies LayoutServerLoad
