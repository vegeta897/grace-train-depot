import { COLOR_NAMES } from 'grace-train-lib'
import type { DepotCar } from 'grace-train-lib/data'

// export type Ticket = {
// 	name: string
// 	colors: [fg: string, bg: string]
// 	description: string
// 	check: (car: DepotCar) => boolean
// 	scope: TopperScope
// }

const TICKETS = [
	'stars',
	'hearts',
	'flowers',
	'poggers',
	'mort',
	'many hats',
	'party',
] as const
export type TicketName = (typeof TICKETS)[number]
type TicketScope = 'decals' | 'toppers'

export const ticketDefs: Record<
	TicketName,
	{
		colors: [fg: string, bg: string]
		// description: string
		check: (car: DepotCar) => boolean
		scope: TicketScope
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

// Get new list of car tickets that keeps original sorting and adds new tickets to the end
// export function getNewAndLostTicketsForCar(car: DepotCar, oldTickets: TicketName[] = []) {
// 	const lostTickets = oldTickets.filter((ticket) => !ticketDefs[ticket].check(car))
// 	const newTickets = [...oldTickets]
// 	for (const ticket of TICKETS) {
// 		if (!oldTickets.includes(ticket) && ticketDefs[ticket].check(car)) {
// 			newTickets.push(ticket)
// 		}
// 	}
// 	return { newTickets, lostTickets }
// }

export function getTicketsForCar(car: DepotCar, scope?: TicketScope[]) {
	return TICKETS.filter((ticket) => ticketDefs[ticket].check(car))
}
