import { DB } from '$lib/server/db'
import type { Car } from '$lib/types'
import { COLORS } from 'grace-train-lib'

export const UsersDB = new DB<{
	users: {
		twitch: { id: string; username: string; displayName: string }
		cars: Car[]
	}[]
}>('users', {
	users: [
		{
			twitch: { id: '123', username: 'vegeta897', displayName: 'vegeta897' },
			cars: [
				{
					body: 'boxy',
					decals: [
						{
							name: 'heart',
							transform: { translate: { x: 375 / 2, y: 120 }, scale: 1, rotate: 0 },
							id: Date.now(),
							fill: '#2ae3ff',
						},
					],
					wheels: {
						color: COLORS.POP,
						fromCenter: 100,
					},
				},
			],
		},
	],
})

export function updateUserCar(twitchID: string, carIndex: number, carData: Partial<Car>) {
	const user = UsersDB.data.users.find((u) => u.twitch.id === twitchID)
	if (!user) throw `Unknown user Twitch ID ${twitchID}`
	user.cars[carIndex] = { ...user.cars[carIndex], ...carData }
	UsersDB.writeData()
}
