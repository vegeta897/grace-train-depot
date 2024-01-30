import { COLOR_NAMES } from 'grace-train-lib'
import type { DecalName, DepotCar } from 'grace-train-lib/data'

export const SIGNALS = [
	'stars',
	'hearts',
	'flowers',
	'poggers',
	'mort',
	'hat trick',
	'party',
] as const
export type SignalName = (typeof SIGNALS)[number]
type SignalScope = 'decals' | 'toppers'
type SignalProgressFn = (car: DepotCar) => number

export const signalDefs: Record<
	SignalName,
	{
		colors: [fg: string, bg: string]
		getProgress: SignalProgressFn
		scope: SignalScope
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
}

function decalQuantity(decal: DecalName, quantity = 1): SignalProgressFn {
	return (car) => {
		const count = car.decals.filter((d) => d.name === decal).length
		return Math.min(1, count / quantity)
	}
}

export function getSignalsForCar(car: DepotCar, scope?: SignalScope[]) {
	return SIGNALS.filter((signal) => signalDefs[signal].getProgress(car) >= 1)
}
