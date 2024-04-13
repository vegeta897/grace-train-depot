// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
		interface Locals {
			user: import('lucia').User | null
			session: import('lucia').Session | null
			botAgent: boolean
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
