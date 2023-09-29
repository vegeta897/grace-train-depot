<script lang="ts">
	import { COLORS } from 'grace-train-lib'
	import {
		Body,
		Decal,
		type BodyName,
		ContainerSvg,
		Topper,
		Wheels,
		body,
	} from 'grace-train-lib/components'
	import type { ComponentProps } from 'svelte'
	import { fade } from 'svelte/transition'
	import type {
		CarDataWithIds,
		DecalDataWithId,
		TopperDataWithId,
	} from '$lib/server/schemas'
	import Decals from './Decals.svelte'

	export let car: CarDataWithIds
	export let bodyOverride: BodyName | null = null
	export let decalsOverride: DecalDataWithId[] | null = null // Unnecessary?
	export let toppersOverride: TopperDataWithId[] | null = null
	export let transition: ComponentProps<Decal>['transition'] = 'none'
	export let focusDecalZone = false
	export let focusTopperSlot: number | null = null

	$: bodyName = bodyOverride || car.body
	$: decals = decalsOverride || car.decals
	$: toppers = toppersOverride || car.toppers
</script>

<div class="relative w-full">
	<div
		class="transition-all"
		class:opacity-40={focusDecalZone}
		class:saturate-70={focusDecalZone}
	>
		<ContainerSvg>
			<Body name={bodyName} baseColor={car.bodyColor} popColor={car.bodyPopColor}>
				<svelte:fragment slot="decals">
					{#if !focusDecalZone}
						<Decals {decals} {transition} />
					{/if}
				</svelte:fragment>
				<svelte:fragment slot="toppers" let:topLine>
					{#each toppers as topper (topper.id)}
						<g
							class="transition-opacity"
							class:opacity-40={focusTopperSlot !== null &&
								topper.slot !== focusTopperSlot}
						>
							<Topper
								{topLine}
								name={topper.name}
								colors={topper.colors}
								position={topper.position}
								offset={topper.offset}
								scale={topper.scale}
								rotate={topper.rotate}
							/>
						</g>
					{/each}
				</svelte:fragment>
				<Wheels
					rimColor={car.wheels.color}
					capColor={car.bodyColor || COLORS.BASE[3]}
					fromCenter={car.wheels.fromCenter}
					slot="wheels"
				/>
			</Body>
		</ContainerSvg>
	</div>
	{#if focusDecalZone}
		<div class="absolute left-0 top-0 w-full" out:fade={{ delay: 75, duration: 75 }}>
			<ContainerSvg>
				<path fill={car.bodyColor || COLORS.BASE[3]} d={body[bodyName].decalClipPath} />
				<g clip-path="url(#usercar-decal-clip)">
					<Decals {decals} {transition} />
				</g>
				<defs>
					<clipPath id="usercar-decal-clip">
						<path d={body[bodyName].decalClipPath} />
					</clipPath>
				</defs>
			</ContainerSvg>
		</div>
	{/if}
</div>
