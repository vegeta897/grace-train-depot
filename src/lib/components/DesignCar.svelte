<script lang="ts">
	import { COLOR_NAMES } from 'grace-train-lib'
	import {
		Body,
		type Decal,
		type BodyName,
		ContainerSvg,
		Topper,
		Wheels,
		body,
	} from 'grace-train-lib/components'
	import type { ComponentProps } from 'svelte'
	import { fade } from 'svelte/transition'
	import type { CarDataWithIds, TopperDataWithId } from '$lib/server/schemas/car'
	import Decals from './Decals.svelte'

	export let car: CarDataWithIds
	export let bodyOverride: BodyName | null = null
	export let toppersOverride: TopperDataWithId[] | null = null
	export let transition: ComponentProps<Decal>['transition'] = 'none'
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
<div class="relative w-full">
	<div
		class="transition-all"
		class:opacity-40={focusDecalZone}
		class:saturate-70={focusDecalZone}
		bind:clientWidth={svgWidth}
	>
		<ContainerSvg viewBox={cropToCar ? '0 0 375 300' : viewBox} bind:svgElement>
			<Body name={bodyName} baseColor={car.bodyColor} popColor={car.bodyPopColor}>
				<svelte:fragment slot="decals">
					<Decals decals={car.decals} {transition} />
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
		</ContainerSvg>
	</div>
	{#if focusDecalZone}
		<div
			class="absolute"
			style:width="calc(100% + {cropToCar ? '40px' : '0'})"
			style:top="{cropToCar ? -80 : 0}px"
			style:left="{cropToCar ? -20 : 0}px"
			out:fade={{ delay: 75, duration: 75 }}
		>
			<ContainerSvg>
				<path
					fill={car.bodyColor || COLOR_NAMES.BASE.BASE}
					d={body[bodyName].decalClipPath}
				/>
				<g clip-path="url(#designcar-decal-clip)">
					<Decals decals={car.decals} {transition} />
				</g>
				<defs>
					<clipPath id="designcar-decal-clip">
						<path d={body[bodyName].decalClipPath} />
					</clipPath>
				</defs>
			</ContainerSvg>
		</div>
	{/if}
</div>
