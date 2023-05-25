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
	$: pathData = selected ? drawCornerlessPath(size) : ''

	function drawCornerlessPath(size: number) {
		const cornerSize = dashSize / 2 + gapSize
		const sideSize = size - cornerSize * 2
		return `M${rect.x + cornerSize},${
			rect.y
		} h${sideSize} m${cornerSize},${cornerSize} v${sideSize} m${-cornerSize},${cornerSize} h${-sideSize} m${-cornerSize},${-cornerSize} v${-sideSize}`
	}
</script>

<rect {...rect} fill="#fff0" stroke="none" />
{#if selected}
	<path
		class:transition-all={!transforming}
		class:opacity-30={transforming}
		d={pathData}
		{...stroke}
		stroke-linecap="round"
	/>
{:else}
	<rect
		{...rect}
		{...stroke}
		stroke-dashoffset={dashSize / 2}
		stroke-linecap="round"
		fill="none"
	/>
{/if}
