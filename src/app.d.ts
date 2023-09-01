/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import('$lib/server/lucia').Auth
		type DatabaseUserAttributes = Omit<import('@prisma/client').User, 'id' | 'createdAt'>
		type DatabaseSessionAttributes = {}
	}
}

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		interface Locals {
			auth: import('lucia').AuthRequest
		}
	}

	interface ViewTransition {
		updateCallbackDone: Promise<void>
		ready: Promise<void>
		finished: Promise<void>
		skipTransition: () => void
	}

	interface Document {
		startViewTransition(updateCallback: () => Promise<void>): ViewTransition
	}
}

export {}
