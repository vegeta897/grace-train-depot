<script lang="ts" context="module">
	export function calcDashes(ideal: number, available: number) {
		if (available <= 0) return [1, 1]
		const min = ideal / 2
		let dashes = 3 // 1 dash surrounded by spaces
		let best = [available / dashes, dashes]
		while (dashes < Math.ceil(available / min)) {
			const size = available / dashes
			if (Math.abs(ideal - size) < Math.abs(ideal - best[0])) {
				best = [size, dashes]
			}
			dashes += 2 // Every dash has a gap of equal size
		}
		return best
	}
</script>

<script lang="ts">
	export let x1 = 0
	export let x2 = x1
	export let y1 = 0
	export let y2 = y1
	export let color = '#fff'
	export let strokeWidth = 3
	export let dashSize = 8

	$: length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
	$: [dashSize, dashes] = calcDashes(dashSize, length)
</script>

<line
	{x1}
	{x2}
	{y1}
	{y2}
	stroke={color}
	stroke-width={strokeWidth}
	stroke-dasharray={dashSize}
/>
