<script lang="ts">
	import { Decal, type DecalName } from 'grace-train-lib'
	import { DECAL_COLORS, DECAL_MAX_SLOTS } from '$lib/common/constants'
	import Controls from './Controls.svelte'
	import type { DecalData } from '$lib/types'
	import DecalCanvas from './DecalCanvas.svelte'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../../stores'
	import ShapePicker from './ShapePicker.svelte'

	const { localCars, designShortId, designCar } = getDesignStores()
	const { hoveredSlot, selectedSlot } = getDecalStores()

	hoveredSlot.set(null)
	selectedSlot.set(null)

	let addingDecal: -1 | 1 | null = null

	$: if ($selectedSlot !== null) addingDecal = null

	function clickEmptySlot(beforeOrAfter: -1 | 1) {
		addingDecal = addingDecal === beforeOrAfter ? null : beforeOrAfter
		selectedSlot.set(null)
	}

	function clickDecalSlot(slot: number) {
		selectedSlot.set($selectedSlot === slot ? null : slot)
	}

	function addDecal(shape: DecalName) {
		if (addingDecal === null) return
		const newDecal: DecalData = {
			name: shape,
			transform: { x: 375 / 2, y: 120, scale: 1, rotate: 0 },
			id: Date.now(), // Local only, will be overwritten after saving to server
			fill: '', // Will be overwritten below
			slot: 0, // Will be overwritten below
			new: true,
		}
		localCars.update((cars) => {
			if (addingDecal! > 0) {
				cars[$designShortId].decals.push(newDecal)
			} else {
				cars[$designShortId].decals.unshift(newDecal)
			}
			cars[$designShortId].decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			newDecal.fill = DECAL_COLORS[cars[$designShortId].decals.length - 1]
			selectedSlot.set(newDecal.slot)
			return cars
		})
		addingDecal = null
	}

	// const testDot = { x: -9, y: -9 } // Position a red dot on the page
</script>

<section>
	<DecalCanvas car={$designCar} />
	<div class="rounded-box flex flex-col gap-4 bg-neutral px-3 py-4">
		<ol
			class="nunito flex h-16 justify-center gap-2"
			class:max-sm:gap-1={$designCar.decals.length >= 3}
		>
			{#if $designCar.decals.length < DECAL_MAX_SLOTS - 1 && $designCar.decals.length > 0}
				<li class="w-20">
					<button
						class="btn btn-outline btn-block h-16 px-0 text-4xl"
						class:btn-active={addingDecal === -1}
						on:click={() => clickEmptySlot(-1)}>+</button
					>
				</li>
			{/if}
			{#each $designCar.decals as decal}
				<li class="w-28 shrink">
					<button
						class="btn-hover-grow btn btn-block h-16 px-0 text-4xl"
						class:selected-decal={decal.slot === $selectedSlot}
						on:click={() => clickDecalSlot(decal.slot)}
						on:mouseenter={() => hoveredSlot.set(decal.slot)}
						on:mouseleave={() => hoveredSlot.set(null)}
						on:focus={() => hoveredSlot.set(decal.slot)}
						on:blur={() => hoveredSlot.set(null)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="-50 -50 100 100"
							class="w-10 overflow-visible 2xs:w-11"
						>
							<Decal
								name={decal.name}
								fill={decal.fill}
								transform={{
									x: 0,
									y: 0,
									scale: 0.7 + Math.log10(decal.transform.scale) * 0.8,
									rotate: decal.transform.rotate,
								}}
								transition={['fill', 'opacity']}
							/>
						</svg>
					</button>
				</li>
			{/each}
			{#if $designCar.decals.length < DECAL_MAX_SLOTS}
				<li class="w-20">
					<button
						class="btn btn-outline btn-block h-16 px-0 text-4xl"
						class:btn-active={addingDecal === 1}
						on:click={() => clickEmptySlot(1)}>+</button
					>
				</li>
			{/if}
		</ol>
		{#if addingDecal !== null}
			<ShapePicker onClick={addDecal} />
		{/if}
		{#if $selectedSlot !== null}
			<Controls slot={$selectedSlot} />
		{/if}
	</div>
	<!-- <div
		class="absolute left-0 top-0 h-[3px] w-[3px] rounded-sm bg-red-600"
		style:transform="translate({testDot.x - 1.5}px,{testDot.y - 1.5}px)"
	/> -->
</section>

<style>
	.selected-decal {
		background: #605de9;
		border-color: #605de9;
	}
</style>
