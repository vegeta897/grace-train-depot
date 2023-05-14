import { writable, type Writable } from 'svelte/store'

type UserCar = {
	body: 'boxy' | 'tanky'
}

export const userCar: Writable<UserCar> = writable({ body: 'boxy' })
