import { getContext, hasContext, setContext } from 'svelte'

export function wrapNumber(val: number, min: number, max: number) {
	const range = max - min
	return min + ((((val - min) % range) + range) % range)
}

// TODO: Ensure this doesn't leak store data across clients
export function defineContext<T>(data: T): () => T {
	const key = Symbol()
	return () => {
		if (hasContext(key)) return getContext(key)
		setContext(key, data)
		return data
	}
}
