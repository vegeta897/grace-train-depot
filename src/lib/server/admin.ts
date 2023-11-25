import { ADMIN_TWITCH_ID, MOD_TWITCH_IDS, TRUSTED_TWITCH_IDS } from '$env/static/private'

const modTwitchIds = MOD_TWITCH_IDS.split(',')
const trustedTwitchIds = TRUSTED_TWITCH_IDS.split(',')

export function userIsAdmin(user: string | { twitchUserId: string }) {
	if (typeof user === 'string') return user === ADMIN_TWITCH_ID
	return user.twitchUserId === ADMIN_TWITCH_ID
}

export function userIsMod(user: string | { twitchUserId: string }) {
	if (userIsAdmin(user)) return true // Admin is also a mod
	if (typeof user === 'string') return modTwitchIds.includes(user)
	return modTwitchIds.includes(user.twitchUserId)
}

export function userIsTrusted(user: string | { twitchUserId: string }) {
	if (userIsMod(user)) return true // Mods are always trusted
	if (typeof user === 'string') return trustedTwitchIds.includes(user)
	return trustedTwitchIds.includes(user.twitchUserId)
}
