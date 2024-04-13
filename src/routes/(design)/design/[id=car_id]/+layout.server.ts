import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import prisma from '$lib/server/prisma'
import { transformCarFromDBWithIds } from '$lib/server/car'
import type { User } from 'lucia'
import type { DesignCar } from '$lib/server/schemas/car'
import { THEMES, type ThemeName } from '$lib/themes'

const carIncludeQuery = { decals: true, toppers: true } as const

export const load = (async ({ params, locals }) => {
	// console.log('/design/ layout server load')
	// Redirect bots to car page
	if (locals.botAgent) redirect(302, params.id === 'new' ? '/' : `/c/${params.id}`)
	const data: {
		user?: User
		savedCar?: DesignCar
		firstCar: boolean
		missingThemes?: ThemeName[]
	} = {
		firstCar: true,
	}
	if (locals.user) {
		data.user = locals.user
		data.firstCar = !(await prisma.car.findFirst())
		// TODO: Move this to +page.server.ts
		const designedThemes: Set<string> = new Set()
		const carThemeLists = await prisma.car.groupBy({
			by: ['themes'],
			where: { userId: locals.user.id, themes: { isEmpty: false } },
		})
		carThemeLists.forEach((l) => l.themes.forEach((theme) => designedThemes.add(theme)))
		data.missingThemes = THEMES.filter((theme) => !designedThemes.has(theme))
	}
	if (params.id === 'new') return data
	if (!locals.user) redirect(302, `/login?redirectTo=/design/${params.id}`)
	const savedCar = await prisma.car.findUnique({
		where: { shortId: params.id, userId: locals.user.id },
		include: carIncludeQuery,
	})
	if (savedCar) {
		data.savedCar = transformCarFromDBWithIds(savedCar)
		return data
	}
	// Car doesn't belong to logged in user, redirect to car page
	redirect(302, `/c/${params.id}`)
}) satisfies LayoutServerLoad
