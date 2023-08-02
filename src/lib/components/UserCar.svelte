<script lang="ts">
	import {
		Body,
		Decal,
		type BodyName,
		ContainerSvg,
		COLORS,
		DECAL_CLIP_PATHS,
		WheelsChange,
	} from 'grace-train-lib'
	import type { ComponentProps } from 'svelte'
	import { fade } from 'svelte/transition'
	import type { Car, DecalData } from '$lib/types'
	import Decals from './Decals.svelte'

	export let car: Car
	export let bodyOverride: BodyName | null = null
	export let decalsOverride: DecalData[] | null = null
	export let transition: ComponentProps<Decal>['transition'] = 'none'
	export let focusDecalZone = false
	export let width: number = 0 // Read-only, for parent components to use

	$: bodyName = bodyOverride || car.body
	$: decals = decalsOverride || car.decals
</script>

<div
	class="w-full transition-all"
	class:opacity-40={focusDecalZone}
	class:saturate-70={focusDecalZone}
	bind:clientWidth={width}
>
	<Body name={bodyName}>
		<svelte:fragment slot="decals">
			{#if !focusDecalZone}
				<Decals {decals} {transition} />
			{/if}
		</svelte:fragment>
		<WheelsChange
			rimColor={car.wheels.color}
			fromCenter={car.wheels.fromCenter}
			slot="wheels"
		/>
	</Body>
</div>
{#if focusDecalZone}
	<div class="absolute top-0 w-full" out:fade={{ delay: 75, duration: 75 }}>
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
