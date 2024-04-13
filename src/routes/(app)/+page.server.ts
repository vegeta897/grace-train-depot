import prisma from '$lib/server/prisma'
import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'
import { type ThemeName } from '$lib/themes'
import { getUserCars } from '$lib/server/user'

export const load = (async ({ parent }) => {
	const parentData = await parent()
	if (!parentData.user) return
	const cars = await getUserCars(parentData.user.userId, 5)
	if (cars.length === 0) redirect(302, '/design/new')
	const carCount = await prisma.car.count({ where: { userId: parentData.user.userId } })
	const carThemeLists = await prisma.car.groupBy({
		by: ['themes'],
		_count: true,
		where: { userId: parentData.user.userId, themes: { isEmpty: false } },
	})
	const themeCarCount: Partial<Record<ThemeName, number>> = {}
	carThemeLists.forEach(({ _count, themes }) => {
		for (const theme of themes as ThemeName[]) {
			themeCarCount[theme] = (themeCarCount[theme] || 0) + _count
		}
	})
	return {
		cars,
		carCount,
		themeCarCount,
	}
}) satisfies PageServerLoad
