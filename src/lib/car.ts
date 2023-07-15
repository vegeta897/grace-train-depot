import type { Car } from '$lib/types'

export async function updateCar(id: number, data: Partial<Car>) {
	console.log('queuing update')
	const updateResponse = await fetch('/api/car', {
		method: 'POST',
		body: JSON.stringify({ id, data }),
		headers: { 'content-type': 'application/json' },
	})
	console.log('posted,', await updateResponse.json())
}
