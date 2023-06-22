<script lang="ts">
	import {
		Body,
		Decal,
		type BodyName,
		ContainerSvg,
		COLORS,
		DECAL_CLIP_PATHS,
		Wheels,
	} from 'grace-train-lib'
	import { userCar } from '../store'
	import type { ComponentProps } from 'svelte'
	import { fade } from 'svelte/transition'

	export let bodyOverride: BodyName | null = null
	export let transition: ComponentProps<Decal>['transition'] = 'none'
	export let focusDecalZone = false

	$: name = bodyOverride || $userCar.body
</script>

<div
	class="w-full transition-all"
	class:opacity-50={focusDecalZone}
	class:saturate-30={focusDecalZone}
>
	<Body {name}>
		<svelte:fragment slot="decals">
			{#if !focusDecalZone}
				{#each $userCar.decals as userDecal (userDecal.id)}
					<Decal
						name={userDecal.name}
						transform={userDecal.transform}
						fill={userDecal.fill}
						{transition}
					/>
				{/each}
			{/if}
		</svelte:fragment>
		<Wheels rimColor={$userCar.wheelColor} slot="wheels" />
	</Body>
</div>
{#if focusDecalZone}
	<div class="absolute top-0 w-full" out:fade={{ duration: 150 }}>
		<ContainerSvg>
			<path fill={COLORS.BASE} d={DECAL_CLIP_PATHS[name]} />
			<g clip-path="url(#usercar-decal-clip)">
				{#each $userCar.decals as userDecal (userDecal.id)}
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
