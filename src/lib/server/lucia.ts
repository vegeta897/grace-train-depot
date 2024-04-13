import { Lucia, TimeSpan } from 'lucia'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import prisma from '$lib/server/prisma'
import { dev } from '$app/environment'
import {
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
	TWITCH_REDIRECT,
} from '$env/static/private'
import { Twitch } from 'arctic'
import type { TrustLevel } from '@prisma/client'

const adapter = new PrismaAdapter(prisma.session, prisma.user)

export const lucia = new Lucia(adapter, {
	getUserAttributes: (attributes) => {
		return {
			twitchUsername: attributes.twitchUsername,
			twitchDisplayName: attributes.twitchDisplayName,
			twitchUserId: attributes.twitchUserId,
			trustLevel: attributes.trustLevel,
		}
	},
	sessionExpiresIn: new TimeSpan(30, 'd'),
	sessionCookie: {
		name: 'auth_session',
		expires: false,
		attributes: { secure: !dev },
	},
})

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia
		DatabaseUserAttributes: DatabaseUserAtributes
	}
}

interface DatabaseUserAtributes {
	twitchUsername: string
	twitchDisplayName: string
	twitchUserId: string
	trustLevel: TrustLevel
}

export const twitchAuth = new Twitch(
	TWITCH_CLIENT_ID,
	TWITCH_CLIENT_SECRET,
	TWITCH_REDIRECT
)
