<script lang="ts">
	export let scale: number = 1
	export let width = 100
	export let height = 100
	export let faded: boolean = false
	export let corners: boolean = true
	export let hidden: boolean = false
	export let strokeWidthScale = 1
	export let fullHitbox: boolean = false

	const cornerAngleTrim = 25 // 25 deg trim = 40 deg sweep

	const degToRad = (deg: number) => deg * (Math.PI / 180)

	$: pad = 10 / scale
	$: pWidth = width + pad
	$: pHeight = height + pad
	$: rect = { x: -pWidth / 2, y: -pHeight / 2, width: pWidth, height: pHeight }
	$: cRadius = (25 + pad) / 2 // Should complement decals with 25 stroke-width corners
	$: ccos = cRadius * (1 - Math.cos(degToRad(cornerAngleTrim)))
	$: csin = cRadius * Math.sin(degToRad(cornerAngleTrim))
	$: cs = cRadius - ccos - csin
	$: availableWidth = pWidth - (ccos + cs) * 2
	$: availableHeight = pHeight - (ccos + cs) * 2
	$: idealUnit = degToRad(90 - cornerAngleTrim * 2) * cRadius // Matches corner length
	$: widthUnits = calcUnits(idealUnit, availableWidth)
	$: dashedWidth = (widthUnits[1] - 2) * widthUnits[0]
	$: widthSpacer = (availableWidth - dashedWidth) / 2
	$: heightUnits = calcUnits(idealUnit, availableHeight)
	$: dashedHeight = (heightUnits[1] - 2) * heightUnits[0]
	$: heightSpacer = (availableHeight - dashedHeight) / 2

	function calcUnits(ideal: number, available: number) {
		if (available <= 0) return [1, 1]
		const min = ideal / 2
		let units = 3 // 1 dash surrounded by spaces
		let best = [available / 3, units]
		while (units < Math.ceil(available / min)) {
			const size = available / units
			if (Math.abs(ideal - size) < Math.abs(ideal - best[0])) {
				best = [size, units]
			}
			units += 2 // Every dash adds 2 units
		}
		return best
	}

	const cornerPathNodes = [
		[-0.5, -0.5, 1, -1],
		[1, 0, 1, 1],
		[0, 1, -1, 1],
		[-1, 0, -1, -1],
	]

	$: cornersPath = cornerPathNodes
		.map(
			([mx, my, ax, ay], c) =>
				`m${availableWidth * mx - (c === 0 ? cs : 0)},${
					availableHeight * my
				} a${cRadius} ${cRadius} 0 0 1 ${cs * ax} ${cs * ay}`
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
			stroke-dasharray={widthUnits[0]}
			d="M{-pWidth / 2 + cs + ccos},{-pHeight /
				2} m{widthSpacer},0 h{dashedWidth} m0,{pHeight} h{-dashedWidth}"
		/>
		<!-- Vertical dashes -->
		<path
			stroke-dasharray={heightUnits[0]}
			d="M{-pWidth / 2},{-pHeight / 2 +
				cs +
				ccos} m0,{heightSpacer} v{dashedHeight} m{pWidth},0 v{-dashedHeight}"
		/>
	</g>
{/if}
