<script lang="ts">
	export let scale: number
	export let selected: boolean
	export let transforming: boolean

	$: size = 100 + 28 / scale
	$: rect = { x: -size / 2, y: -size / 2, width: size, height: size }
	$: dashSize = size / 4 / 2
	$: gapSize = size / 4 / 2
	$: stroke = {
		stroke: '#fff',
		'stroke-width': 5 / scale,
		'stroke-dasharray': `${dashSize} ${gapSize}`,
	}
	$: pathData = drawPath(size, !selected)

	const sides = [
		[1, 0, 1, 1, 0, 1],
		[0, 1, -1, 1, -1, 0],
		[-1, 0, -1, -1, 0, -1],
		[0, -1, 1, -1, 0, 0],
	]

	function drawPath(size: number, corners: boolean) {
		const halfDash = dashSize / 2
		const cornerSize = halfDash + gapSize
		const sideSize = size - cornerSize * 2 + (corners ? gapSize : 0)
		let pathData = `M${rect.x + cornerSize},${rect.y}`
		for (let side = 0; side < 4; side++) {
			const [sx, sy, cx, cy, mx, my] = sides[side]
			pathData += `l${sx * sideSize},${sy * sideSize} `
			pathData += corners
				? `a${halfDash} ${halfDash} 0 0 1 ${cx * halfDash} ${cy * halfDash} m${
						mx * gapSize
				  },${my * gapSize}`
				: `m${cx * cornerSize} ${cy * cornerSize}`
		}
		return pathData
	}
</script>

<rect {...rect} fill="#fff0" stroke="none" />
<path
	class:transition-opacity={selected && !transforming}
	class:opacity-30={selected && transforming}
	d={pathData}
	{...stroke}
	stroke-linecap="round"
	fill="none"
/>
