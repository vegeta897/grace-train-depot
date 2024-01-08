import { getContext, hasContext, setContext } from 'svelte'
import {
	draggable as neodraggable,
	type DragEventData,
	type DragOptions,
} from '@neodrag/svelte'
import type { Action } from 'svelte/action'
import { quadInOut } from 'svelte/easing'

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

export const degToRad = (degrees: number) => degrees * (Math.PI / 180)

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

// https://larsenwork.com/easing-gradients/
export function getSideFadeGradient(sidePercent: number, angle = 90) {
	const steps = 10
	const step = (i: number) => (i + 1) / steps
	const percent = (i: number) => step(i) * sidePercent
	const stepValues = createArray(steps, (_, i) => quadInOut(step(i)))
	return `linear-gradient(${angle}deg, rgba(0,0,0,0) 0, ${stepValues.map(
		(v, i) => `rgba(0,0,0,${v}) ${percent(i)}%`
	)} ${100 - sidePercent}%, ${stepValues.map(
		(v, i) => `rgba(0,0,0,${1 - v}) ${100 - sidePercent + percent(i)}%`
	)})`
}

export function getFadeGradient(hsl: string) {
	const steps = 10
	const stepValues = [...createArray(steps, (_, i) => quadInOut(i / 10)), 1]
	return stepValues.map((v, i) => `hsl(${hsl} / ${v}) ${(i / steps) * 100}%`).join(', ')
}

export const pluralize = (quantity: number, unit: string) =>
	unit + (quantity === 1 ? '' : 's')

export function getRelativeTime(since: Date) {
	const now = Date.now()
	const minutes = Math.round((now - since.getTime()) / 1000 / 60)
	if (minutes < 60) return [minutes, pluralize(minutes, 'minute')]
	const hours = Math.round(minutes / 60)
	if (hours < 24) return [hours, pluralize(hours, 'hour')]
	const days = Math.round(hours / 24)
	if (days < 365) return [days, pluralize(days, 'day')]
	const years = Math.round(days / 365)
	return [years, pluralize(years, 'year')]
}

const createArray = <T extends any>(
	length: number,
	fn: (_: unknown, i: number) => T
): T[] => Array.from({ length }, fn)
