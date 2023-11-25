import { lucia } from 'lucia'
import prisma from '$lib/server/prisma'
import { prisma as prismaAdapter } from '@lucia-auth/adapter-prisma'
import { dev } from '$app/environment'
import { sveltekit } from 'lucia/middleware'
import { twitch } from '@lucia-auth/oauth/providers'
import {
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
	TWITCH_REDIRECT,
} from '$env/static/private'

export const auth = lucia({
	adapter: prismaAdapter(prisma),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	getUserAttributes: (data) => {
		return {
			twitchUsername: data.twitchUsername,
			twitchDisplayName: data.twitchDisplayName,
			twitchUserId: data.twitchUserId,
			trusted: data.trusted,
		}
	},
	sessionExpiresIn: {
		activePeriod: 3 * 60 * 60 * 1000, // Revives if idle period not expired
		idlePeriod: 30 * 24 * 60 * 60 * 1000, // Extends when active period refreshed
	},
})

export const twitchAuth = twitch(auth, {
	clientId: TWITCH_CLIENT_ID,
	clientSecret: TWITCH_CLIENT_SECRET,
	redirectUri: TWITCH_REDIRECT,
})

export type Auth = typeof auth
