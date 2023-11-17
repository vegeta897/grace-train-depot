<script lang="ts">
	$$restProps
	export let scale: number = 1
	export let width = 100
	export let height = 100
	export let faded: boolean = false
	export let corners: boolean = true
	export let animate: boolean = false
	export let hidden: boolean = false
	export let strokeWidthScale = 1
	export let fullHitbox: boolean = false

	$: pad = 10 / scale
	$: paddedWidth = width + pad
	$: paddedHeight = height + pad
	$: rect = {
		x: -width / 2 - pad / 2,
		y: -height / 2 - pad / 2,
		width: paddedWidth,
		height: paddedHeight,
	}
	$: dashSize = paddedWidth / 4 / 2
	$: gapSize = paddedWidth / 4 / 2
	$: stroke = {
		stroke: '#fff',
		'stroke-width': (5 / scale) * strokeWidthScale,
		'stroke-dasharray': `${dashSize} ${gapSize}`,
	}
	$: pathData = drawPath(paddedWidth, true /*corners*/)
	$: transition = animate
		? 'stroke-width 150ms cubic-bezier(0.4,0,0.2,1), opacity 150ms cubic-bezier(0.4,0,0.2,1)'
		: 'none'

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

{#if fullHitbox}<rect {...rect} fill="#fff0" stroke="none" />{/if}
{#if !hidden}
	<!-- <path
		class="pointer-events-none"
		style:transition
		class:opacity-30={faded}
		d={pathData}
		{...stroke}
		stroke-linecap="round"
		fill="none"
	/> -->
{/if}
<rect
	class="pointer-events-none"
	{...rect}
	stroke="#ff0"
	stroke-width="2"
	stroke-dasharray="5"
	fill="none"
/>
