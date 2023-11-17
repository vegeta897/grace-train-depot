import { getContext, hasContext, setContext } from 'svelte'
import {
	draggable as neodraggable,
	type DragEventData,
	type DragOptions,
} from '@neodrag/svelte'
import type { Action } from 'svelte/action'

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

// Wrapper for neodrag to broaden HTMLElement type to Element
export const draggable = neodraggable as Action<
	Element,
	DragOptions,
	{
		'on:neodrag:start': (e: CustomEvent<DragEventData>) => void
		'on:neodrag': (e: CustomEvent<DragEventData>) => void
		'on:neodrag:end': (e: CustomEvent<DragEventData>) => void
	}
>
