import { SPICE_BOT_URL, DEPOT_SECRET, SPICE_BOT_HOSTNAME } from '$env/static/private'

// TODO: Call this when a user deletes their account
export async function hideUserFromOverlay(twitchUserId: string) {
	console.log('hiding user', twitchUserId)
	fetch(`${SPICE_BOT_URL}/depot-user-hide/`, {
		body: JSON.stringify({ userId: twitchUserId }),
		method: 'POST',
		headers: {
			Authorization: DEPOT_SECRET,
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Origin: SPICE_BOT_HOSTNAME,
		},
	}).catch((e) => console.log('error POSTing depot-user-hide to spice-bot', e))
}
