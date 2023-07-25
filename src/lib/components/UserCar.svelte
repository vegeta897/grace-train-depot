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
	import type { Car } from '$lib/types'

	export let car: Car
	export let bodyOverride: BodyName | null = null
	export let transition: ComponentProps<Decal>['transition'] = 'none'
	export let focusDecalZone = false

	$: name = bodyOverride || car.body
</script>

<div
	class="w-full transition-all"
	class:opacity-50={focusDecalZone}
	class:saturate-30={focusDecalZone}
>
	<Body {name}>
		<svelte:fragment slot="decals">
			{#if !focusDecalZone}
				{#each car.decals as userDecal (userDecal.id)}
					<Decal
						name={userDecal.name}
						transform={userDecal.transform}
						fill={userDecal.fill}
						{transition}
					/>
				{/each}
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
			<path fill={COLORS.BASE} d={DECAL_CLIP_PATHS[name]} />
			<g clip-path="url(#usercar-decal-clip)">
				{#each car.decals as userDecal (userDecal.id)}
					<Decal
						name={userDecal.name}
						transform={userDecal.transform}
						fill={userDecal.fill}
						{transition}
					/>
				{/each}
			</g>
			<defs>
				<clipPath id="usercar-decal-clip">
					<path d={DECAL_CLIP_PATHS[name]} />
				</clipPath>
			</defs>
		</ContainerSvg>
	</div>
{/if}
