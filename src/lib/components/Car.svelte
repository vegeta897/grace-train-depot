<script lang="ts">
	import {
		Body,
		Decal,
		type BodyName,
		ContainerSvg,
		COLORS,
		DECAL_CLIP_PATHS,
		WheelsChange,
		Topper,
	} from 'grace-train-lib'
	import type { ComponentProps } from 'svelte'
	import { fade } from 'svelte/transition'
	import type { CarDataWithIds, DecalDataWithId } from '$lib/schemas'
	import Decals from './Decals.svelte'

	export let car: CarDataWithIds
	export let bodyOverride: BodyName | null = null
	export let decalsOverride: DecalDataWithId[] | null = null
	export let transition: ComponentProps<Decal>['transition'] = 'none'
	export let focusDecalZone = false

	$: bodyName = bodyOverride || car.body
	$: decals = decalsOverride || car.decals
</script>

<div class="relative w-full">
	<div
		class="transition-all"
		class:opacity-40={focusDecalZone}
		class:saturate-70={focusDecalZone}
	>
		<Body name={bodyName}>
			<svelte:fragment slot="decals">
				{#if !focusDecalZone}
					<Decals {decals} {transition} />
				{/if}
			</svelte:fragment>
			<svelte:fragment slot="toppers" let:positions>
				{#each car.toppers as topper}
					<Topper
						name={topper.name}
						position={positions[topper.position]}
						colors={topper.colors}
						adjust={topper.adjust}
					/>
				{/each}
			</svelte:fragment>
			<WheelsChange
				rimColor={car.wheels.color}
				fromCenter={car.wheels.fromCenter}
				slot="wheels"
			/>
		</Body>
	</div>
	{#if focusDecalZone}
		<div class="absolute left-0 top-0 w-full" out:fade={{ delay: 75, duration: 75 }}>
			<ContainerSvg>
				<path fill={COLORS.BASE} d={DECAL_CLIP_PATHS[bodyName]} />
				<g clip-path="url(#usercar-decal-clip)">
					<Decals {decals} {transition} />
				</g>
				<defs>
					<clipPath id="usercar-decal-clip">
						<path d={DECAL_CLIP_PATHS[bodyName]} />
					</clipPath>
				</defs>
			</ContainerSvg>
		</div>
	{/if}
</div>
