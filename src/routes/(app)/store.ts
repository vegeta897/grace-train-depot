import { defineContext } from '$lib/util'
import { writable } from 'svelte/store'

type Toast = { type: 'success' | 'info' | 'error'; message: string }

const toasts = writable<Toast[]>([])

export const getAppStores = defineContext({
	toasts,
	addToast(type: Toast['type'], message: string, duration = 3000) {
		const toast = { type, message }
		toasts.update((toasts) => {
			return [...toasts, toast]
		})
		setTimeout(() => {
			toasts.update((toasts) => toasts.filter((t) => t !== toast))
		}, duration)
	},
})
