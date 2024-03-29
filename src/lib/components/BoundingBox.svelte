<script lang="ts" context="module">
	import { degToRad } from '$lib/util'
	import { calcDashes } from './DashLine.svelte'

	const cornerAngleTrim = 25 // 25 deg trim = 40 deg sweep
	const cornerCosUnit = 1 - Math.cos(degToRad(cornerAngleTrim))
	const cornerSinUnit = Math.sin(degToRad(cornerAngleTrim))
	const idealDashUnit = degToRad(90 - cornerAngleTrim * 2)

	const cornerPathNodes = [
		[-0.5, -0.5, 1, -1],
		[1, 0, 1, 1],
		[0, 1, -1, 1],
		[-1, 0, -1, -1],
	]
</script>

<script lang="ts">
	export let scale: number = 1
	export let width = 100
	export let height = 100
	export let faded: boolean = false
	export let corners: boolean = true
	export let hidden: boolean = false
	export let strokeWidthScale = 1
	export let fullHitbox: boolean = false
	export let centered = true
	export let padding = 0

	$: pad = 10 / scale
	$: pWidth = width + pad + padding * 2
	$: pHeight = height + pad + padding * 2
	$: top = -(centered ? pHeight : pad) / 2 - padding
	$: left = -(centered ? pWidth : pad) / 2 - padding
	$: rect = { x: left, y: top, width: pWidth, height: pHeight }
	$: cRadius = Math.min(pWidth / 2, pHeight / 2, (25 + pad) / 2) // Fits stroke-width 25 corners
	$: ccos = cRadius * cornerCosUnit
	$: cSize = cRadius - ccos - cRadius * cornerSinUnit
	$: availableWidth = pWidth - (ccos + cSize) * 2
	$: availableHeight = pHeight - (ccos + cSize) * 2
	$: idealDash = idealDashUnit * cRadius // Matches corner length
	$: widthDashes = calcDashes(idealDash, availableWidth)
	$: dashedWidth = (widthDashes[1] - 2) * widthDashes[0]
	$: widthSpacer = (availableWidth - dashedWidth) / 2
	$: heightDashes = calcDashes(idealDash, availableHeight)
	$: dashedHeight = (heightDashes[1] - 2) * heightDashes[0]
	$: heightSpacer = (availableHeight - dashedHeight) / 2

	$: cornersPath =
		(centered ? '' : `M${width / 2} ${height / 2}`) +
		cornerPathNodes
			.map(
				([mx, my, ax, ay], c) =>
					`m${availableWidth * mx - (c === 0 ? cSize : 0)},${
						availableHeight * my
					} a${cRadius} ${cRadius} 0 0 1 ${cSize * ax} ${cSize * ay}`
			)
			.join(' ')
</script>

{#if fullHitbox}<rect {...rect} fill="#fff0" stroke="none" />{/if}
{#if !hidden}
	<g
		class="pointer-events-none"
		class:opacity-30={faded}
		stroke="#fff"
		stroke-width={(5 / scale) * strokeWidthScale}
		stroke-linecap="round"
		fill="none"
	>
		{#if corners}
			<path d={cornersPath} />
		{/if}
		<!-- Horizontal dashes -->
		<path
			stroke-dasharray={widthDashes[0]}
			d="M{left +
				cSize +
				ccos},{top} m{widthSpacer},0 h{dashedWidth} m0,{pHeight} h{-dashedWidth}"
		/>
		<!-- Vertical dashes -->
		<path
			stroke-dasharray={heightDashes[0]}
			d="M{left},{top +
				cSize +
				ccos} m0,{heightSpacer} v{dashedHeight} m{pWidth},0 v{-dashedHeight}"
		/>
	</g>
{/if}
