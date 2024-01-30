<script lang="ts">
	import { COLOR_NAMES } from 'grace-train-lib'
	import {
		Body,
		type Decal,
		ContainerSvg,
		Topper,
		Wheels,
	} from 'grace-train-lib/components'
	import type { ComponentProps } from 'svelte'
	import type { DesignCar } from '$lib/server/schemas/car'
	import Decals from './Decals.svelte'
	import type { TopperDataWithId } from '$lib/server/schemas/toppers'
	import type { BodyName } from 'grace-train-lib/data'

	export let car: DesignCar
	export let bodyOverride: BodyName | null = null
	export let toppersOverride: TopperDataWithId[] | null = null
	export let focusDecalZone = false
	export let fadeToppers = false
	export let cropToCar = false
	export let viewBox = '0 0 375 300'
	export let svgWidth = 0

	let svgElement: SVGElement

	$: bodyName = bodyOverride || car.body
	$: toppers = toppersOverride || car.toppers
</script>

<!-- <div class="relative w-full outline outline-1"> -->
<div class="relative w-full" bind:clientWidth={svgWidth}>
	<ContainerSvg viewBox={cropToCar ? '0 0 375 300' : viewBox} bind:svgElement>
		<g
			class="transition-all"
			class:opacity-40={focusDecalZone}
			class:saturate-70={focusDecalZone}
		>
			<Body name={bodyName} baseColor={car.bodyColor} popColor={car.bodyPopColor}>
				<svelte:fragment slot="decals">
					<slot name="decals"><Decals decals={car.decals} /></slot>
				</svelte:fragment>
				<svelte:fragment slot="toppers" let:topLine>
					<slot name="toppers" {topLine}>
						{#each toppers as { id, name, params, position, offset, scale, rotate } (id)}
							{@const topperData = { name, params, position, offset, scale, rotate }}
							<g class:opacity-50={fadeToppers}>
								<Topper {topLine} {...topperData} />
							</g>
						{/each}
					</slot>
				</svelte:fragment>
				<Wheels
					rimColor={car.wheelColor}
					capColor={car.bodyColor || COLOR_NAMES.BASE.BASE}
					fromCenter={car.wheelFromCenter}
					size={car.wheelSize}
					slot="wheels"
				/>
			</Body>
		</g>
		<slot />
	</ContainerSvg>
</div>
