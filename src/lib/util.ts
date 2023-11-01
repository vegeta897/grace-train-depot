import { getContext, hasContext, setContext } from 'svelte'

export function wrapNumber(val: number, min: number, max: number) {
	const range = max - min
	return min + ((((val - min) % range) + range) % range)
}

export const randomIntRange = (minOrMax: number, max?: number) => {
	const min = max === undefined ? 0 : minOrMax
	const range = max === undefined ? minOrMax : max - minOrMax
	return Math.floor(min + Math.random() * (range + 1))
}

export const randomElement = <T>(arr: T[]): T => arr[randomIntRange(0, arr.length - 1)]

// TODO: Ensure this doesn't leak store data across clients
export function defineContext<T>(data: T): () => T {
	const key = Symbol()
	return () => {
		if (hasContext(key)) return getContext(key)
		setContext(key, data)
		return data
	}
}

export function objectContainsTrue(object: Record<string, any>) {
	for (const key in object) {
		if (object[key]) return true
	}
}

export const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)
