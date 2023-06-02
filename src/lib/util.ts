export type Transform = {
	translate: { x: number; y: number }
	scale: number
	rotate: number
}

export function wrapNumber(val: number, min: number, max: number) {
	const range = max - min
	return min + ((((val - min) % range) + range) % range)
}
