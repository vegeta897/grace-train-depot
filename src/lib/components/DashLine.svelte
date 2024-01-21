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
	export let x2: number | undefined = undefined
	export let y1 = 0
	export let y2: number | undefined = undefined
	export let color = '#fff'
	export let strokeWidth = 3
	export let targetDashSize = 8
	export let dynamicDashSize = false

	$: _x2 = x2 ?? x1
	$: _y2 = y2 ?? y1
	$: length = Math.sqrt((_x2 - x1) ** 2 + (_y2 - y1) ** 2)
	$: dashSize = dynamicDashSize ? calcDashes(targetDashSize, length)[0] : targetDashSize
</script>

<line
	{x1}
	x2={_x2}
	{y1}
	y2={_y2}
	stroke={color}
	stroke-width={strokeWidth}
	stroke-dasharray={dashSize}
/>
