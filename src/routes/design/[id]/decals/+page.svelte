<script lang="ts">
	import { Decal } from 'grace-train-lib'
	import { DECAL_COLORS, DECAL_MAX_SLOTS } from '$lib/common/constants'
	import Controls from './Controls.svelte'
	import type { PageData } from './$types'
	import type { DecalData } from '$lib/types'
	import { cloneDecal, updateDecal } from '$lib/decal'
	import DecalCanvas from './DecalCanvas.svelte'
	import { getDecalStores } from './stores'

	export let data: PageData

	const { hoveredSlot, selectedSlot, decals } = getDecalStores()

	resetDecals()
	hoveredSlot.set(null)
	selectedSlot.set(null)

	function resetDecals() {
		decals.set(data.car.decals.map(cloneDecal))
	}

	let unsaved = false // TODO: Track saved status

	function addDecal(beforeOrAfter: number) {
		const newDecal: DecalData = {
			name: 'star',
			transform: { translate: { x: 375 / 2, y: 120 }, scale: 1, rotate: 0 },
			id: Date.now(), // Local only, will be overwritten after saving to server
			fill: '', // Will be overwritten below
			slot: 0, // Will be overwritten below
		}
		decals.update((d) => {
			if (beforeOrAfter > 0) {
				d.push(newDecal)
			} else {
				d.unshift(newDecal)
			}
			d.forEach((d, i) => (d.slot = i)) // Re-number slots
			newDecal.fill = DECAL_COLORS[d.length - 1]
			selectedSlot.set(newDecal.slot)
			return d
		})
	}

	const testDot = { x: -9, y: -9 } // Position a red dot on the page
</script>

<section>
	<DecalCanvas car={data.car} />
	<div class="bg-neutral rounded-box px-3 py-1 mb-4">
		<ol
			class="flex justify-center gap-2 h-16 my-4 nunito"
			class:max-sm:gap-1={$decals.length >= 3}
		>
			{#if $decals.length < DECAL_MAX_SLOTS - 1 && $decals.length > 0}
				<li class="w-20">
					<button
						class="btn btn-block text-4xl h-16 px-0 btn-outline"
						on:click={() => addDecal(-1)}>+</button
					>
				</li>
			{/if}
			{#each $decals as decal}
				<li class="w-28 shrink">
					<button
						class="btn btn-block text-4xl h-16 px-0 btn-hover-grow"
						class:selected-decal={decal.slot === $selectedSlot}
						on:click={() =>
							selectedSlot.set($selectedSlot === decal.slot ? null : decal.slot)}
						on:mouseenter={() => hoveredSlot.set(decal.slot)}
						on:mouseleave={() => hoveredSlot.set(null)}
						on:focus={() => hoveredSlot.set(decal.slot)}
						on:blur={() => hoveredSlot.set(null)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="-50 -50 100 100"
							class="w-10 2xs:w-12"
						>
							<Decal
								name={decal.name}
								fill={decal.fill}
								transition={['fill', 'opacity']}
							/>
						</svg>
					</button>
				</li>
			{/each}
			{#if $decals.length < DECAL_MAX_SLOTS}
				<li class="w-20">
					<button
						class="btn btn-block text-4xl h-16 px-0 btn-outline"
						on:click={() => addDecal(1)}>+</button
					>
				</li>
			{/if}
		</ol>
		{#if $selectedSlot !== null}
			<Controls slot={$selectedSlot} />
		{/if}
	</div>
	<div class="flex gap-4 mb-4 w-full">
		<button disabled={!unsaved} on:click={resetDecals} class="nunito btn btn-lg">
			Reset
		</button>
		<button disabled={!unsaved} class="nunito btn btn-lg">Save</button>
	</div>
	<div
		class="absolute left-0 top-0 h-[3px] w-[3px] rounded-sm bg-red-600"
		style:transform="translate({testDot.x - 1.5}px,{testDot.y - 1.5}px)"
	/>
</section>

<style>
	.selected-decal {
		background: #605de9;
		border-color: #605de9;
	}
</style>
