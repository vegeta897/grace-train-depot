import { COLOR_NAMES } from 'grace-train-lib'
import type { DecalName, DepotCar } from 'grace-train-lib/data'
import { WHEEL_SIZE_MAX } from './common/constants'

export const THEMES = [
	'stars',
	'hearts',
	'flowers',
	'poggers',
	'mort',
	'hat trick',
	'party',
	'big wheels',
] as const
export type ThemeName = (typeof THEMES)[number]
type ThemeScope = 'decals' | 'toppers' | 'wheels'
type ThemeProgressFn = (car: DepotCar) => number

export const themeDefs: Record<
	ThemeName,
	{
		colors: [fg: string, bg: string]
		getProgress: ThemeProgressFn
		scope: ThemeScope
	}
> = {
	stars: {
		colors: [COLOR_NAMES.POP.CANARY, COLOR_NAMES.BASE.VIOLET],
		scope: 'decals',
		getProgress: decalQuantity('star', 2),
	},
	hearts: {
		colors: ['#fff', COLOR_NAMES.POP.POP],
		scope: 'decals',
		getProgress: decalQuantity('heart', 2),
	},
	flowers: {
		colors: [COLOR_NAMES.POP.CANARY, COLOR_NAMES.BASE.HEAT],
		scope: 'decals',
		getProgress: decalQuantity('flower', 3),
	},
	poggers: {
		colors: ['#f04734', '#453093'],
		scope: 'decals',
		getProgress: (car) =>
			car.decals.some((d) => d.name === 'emote' && d.params.emote === 'pogger') ? 1 : 0,
	},
	mort: {
		colors: ['#c21718', '#080c0d'],
		scope: 'decals',
		getProgress: (car) =>
			car.decals.some((d) => d.name === 'emote' && d.params.emote === 'mort') ? 1 : 0,
	},
	'hat trick': {
		colors: [COLOR_NAMES.POP.CANARY, COLOR_NAMES.BASE.HEAT], // TODO: colors
		scope: 'toppers',
		getProgress: (car) => Math.min(1, car.toppers.length / 3),
	},
	party: {
		colors: [COLOR_NAMES.POP.CANARY, COLOR_NAMES.BASE.HEAT], // TODO: colors
		scope: 'toppers',
		getProgress: (car) => (car.toppers.some((t) => t.name === 'party_hat') ? 1 : 0),
	},
	'big wheels': {
		colors: [COLOR_NAMES.POP.LIME, COLOR_NAMES.BASE.PLAYDOUGH], // TODO: colors
		scope: 'wheels',
		getProgress: (car) => Math.max(0, (car.wheelSize ?? 25) - 25) / (WHEEL_SIZE_MAX - 25),
	},
}

function decalQuantity(decal: DecalName, quantity = 1): ThemeProgressFn {
	return (car) => {
		const count = car.decals.filter((d) => d.name === decal).length
		return Math.min(1, count / quantity)
	}
}

export function getThemesForCar(car: DepotCar, scope?: ThemeScope[]) {
	return THEMES.filter((theme) => themeDefs[theme].getProgress(car) >= 1)
}
