import { COLOR_NAMES } from 'grace-train-lib'
import type { DepotCar } from 'grace-train-lib/data'

const SIGNALS = [
	'stars',
	'hearts',
	'flowers',
	'poggers',
	'mort',
	'many hats',
	'party',
] as const
export type SignalName = (typeof SIGNALS)[number]
type SignalScope = 'decals' | 'toppers'

export const signalDefs: Record<
	SignalName,
	{
		colors: [fg: string, bg: string]
		// description: string
		check: (car: DepotCar) => boolean
		scope: SignalScope
	}
> = {
	stars: {
		colors: [COLOR_NAMES.POP.CANARY, COLOR_NAMES.BASE.VIOLET],
		// description: 'have at least 2 star decals',
		scope: 'decals',
		check: (car) => car.decals.filter((d) => d.name === 'star').length >= 2,
	},
	hearts: {
		colors: ['#fff', COLOR_NAMES.POP.POP],
		// description: 'have at least 2 heart decals',
		scope: 'decals',
		check: (car) => car.decals.filter((d) => d.name === 'heart').length >= 2,
	},
	flowers: {
		colors: [COLOR_NAMES.POP.CANARY, COLOR_NAMES.BASE.HEAT],
		// description: 'have at least 3 flower decals',
		scope: 'decals',
		check: (car) => car.decals.filter((d) => d.name === 'flower').length >= 3,
	},
	poggers: {
		colors: ['#f04734', '#453093'],
		// description: 'have at least 1 POGGER decal',
		scope: 'decals',
		check: (car) =>
			car.decals.some((d) => d.name === 'emote' && d.params.emote === 'pogger'),
	},
	mort: {
		colors: ['#c21718', '#080c0d'],
		// description: 'have at least 1 MORT decal',
		scope: 'decals',
		check: (car) =>
			car.decals.some((d) => d.name === 'emote' && d.params.emote === 'mort'),
	},
	'many hats': {
		colors: [COLOR_NAMES.POP.CANARY, COLOR_NAMES.BASE.HEAT], // TODO: colors
		// description: 'have 3 toppers',
		scope: 'toppers',
		check: (car) => car.toppers.length >= 3,
	},
	party: {
		colors: [COLOR_NAMES.POP.CANARY, COLOR_NAMES.BASE.HEAT], // TODO: colors
		// description: 'have at least 2 party hat toppers',
		scope: 'toppers',
		check: (car) => car.toppers.filter((t) => t.name === 'party_hat').length >= 2,
	},
}

export function getSignalsForCar(car: DepotCar, scope?: SignalScope[]) {
	return SIGNALS.filter((signal) => signalDefs[signal].check(car))
}
