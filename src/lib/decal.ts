import { invalidateAll } from '$app/navigation'
import type { DecalData } from './types'

export async function createDecal(carId: number, decalData: DecalData) {
	const createResponse = await fetch('/api/car/decal', {
		method: 'POST',
		body: JSON.stringify({ carId, decalData }),
		headers: { 'content-type': 'application/json' },
	})
	const jsonResponse = await createResponse.json()
	console.log('createDecal response:', jsonResponse)
	invalidateAll()
	return jsonResponse.decalId as number
}

export async function updateDecal(carId: number, decalId: number, decalData: DecalData) {
	const updateResponse = await fetch('/api/car/decal', {
		method: 'PUT',
		body: JSON.stringify({ carId, decalId, decalData }),
		headers: { 'content-type': 'application/json' },
	})
	invalidateAll()
	console.log('updateDecal response:', await updateResponse.json())
}

export async function deleteDecal(carId: number, decalId: number) {
	const updateResponse = await fetch('/api/car/decal', {
		method: 'DELETE',
		body: JSON.stringify({ carId, decalId }),
		headers: { 'content-type': 'application/json' },
	})
	invalidateAll()
	console.log('deleteDecal response:', await updateResponse.json())
}

export function cloneDecal(decal: DecalData): DecalData {
	return { ...decal, transform: { ...decal.transform } }
}
