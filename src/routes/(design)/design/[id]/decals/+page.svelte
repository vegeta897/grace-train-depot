<script lang="ts">
	import {
		ContainerSvg,
		Decal,
		decalDefs,
		type DecalName,
	} from 'grace-train-lib/components'
	import { DECAL_MAX_SLOTS } from '$lib/common/constants'
	import Controls from './Controls.svelte'
	import type { DecalDataWithId } from '$lib/server/schemas'
	import DecalCanvas from './DecalCanvas.svelte'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../stores'
	import ShapePicker from './ShapePicker.svelte'
	import { COLORS } from 'grace-train-lib'

	const { localCars, designShortId, designCar } = getDesignStores()
	const { hoveredSlot, selectedSlot, deleteMode } = getDecalStores()

	// TODO: Prototype a "sliders" mode where x/y/scale/rotate can be set with sliders on one page
	// Could even adjust decal order/slot with a slider! Embrace the sliders!

	// TODO: Allow choosing body color to act as an "eraser" decal

	// TODO: Add randomize button (here and on other pages)
	// Changes shape, color, size, rotation, position, and params. Transition it if possible!

	// TODO: Add keyboard shortcuts (delete, arrows, etc)

	// TODO: Add a toast to discourage adding too many decals

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
		const newDecal: DecalDataWithId = {
			name: shape,
			id: Date.now(),
			x: 375 / 2,
			y: 120,
			scale: 1,
			rotate: 0,
			fill: COLORS.POP[0], // Will be overwritten below
			slot: 0, // Will be overwritten below
			params: decalDefs[shape].getDefaultParamsObject(),
		}
		localCars.update((cars) => {
			const decals = cars[$designShortId].decals
			if (addingDecal! > 0) {
				decals.push(newDecal)
			} else {
				decals.unshift(newDecal)
			}
			decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			newDecal.fill = COLORS.POP[(decals.length + 2) % decals.length]
			selectedSlot.set(newDecal.slot)
			return cars
		})
		addingDecal = null
	}
	const testDot = { x: 0, y: 0 } // Position a red dot on the page
</script>

<section
	class="grid grid-cols-[112px_1fr] grid-rows-[auto_1fr] gap-x-2 lg:grid-cols-[300px_1fr] lg:gap-x-4"
>
	<div
		class="rounded-box sticky top-0 z-10 col-span-2 mb-2 bg-neutral lg:col-span-1 lg:col-start-2 lg:mb-4"
		style:-webkit-backdrop-filter="blur(6px)"
		style:backdrop-filter="blur(6px)"
		style:--tw-bg-opacity="0.8"
	>
		<DecalCanvas
			car={$designCar}
			setTestDot={(x, y) => {
				testDot.x = x
				testDot.y = y
			}}
		/>
	</div>
	<div class="row-start-2 w-full lg:row-span-2 lg:row-start-1">
		<ul class="rounded-box flex w-full flex-col-reverse items-end gap-2 bg-neutral p-3">
			{#each $designCar.decals as decal, d}
				<li class="flex gap-2 lg:h-16">
					<button
						class="btn h-16 w-16 p-2"
						class:selected-decal={decal.slot === $selectedSlot}
						on:click={() => clickDecalSlot(decal.slot)}
						on:mouseenter={() => hoveredSlot.set(decal.slot)}
						on:mouseleave={() => hoveredSlot.set(null)}
						on:focus={() => hoveredSlot.set(decal.slot)}
						on:blur={() => hoveredSlot.set(null)}
					>
						<ContainerSvg viewBox="-50 -50 100 100" class="h-full overflow-visible">
							<Decal
								name={decal.name}
								fill={decal.fill}
								params={decal.params}
								scale={0.7 + Math.log10(decal.scale) * 0.8}
								rotate={decal.rotate}
								transition={['fill', 'opacity']}
								animateAppear
								delayAppear={d * 70}
							/>
						</ContainerSvg>
					</button>
					{#if $deleteMode}
						<button class="btn btn-error btn-outline h-16 w-16">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 9 9"
								class="w-full stroke-current"
							>
								<path
									class="origin-center transition-transform"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="7"
									vector-effect="non-scaling-stroke"
									d="M2,2 L7,7 M7,2 L2,7"
								/>
							</svg>
						</button>
					{/if}
				</li>
			{/each}
			{#if $designCar.decals.length < DECAL_MAX_SLOTS}
				<li class="flex gap-2">
					<button
						class="btn btn-outline h-16 w-16 hover:btn-error"
						class:btn-error={$deleteMode}
						on:click={() => deleteMode.set(!$deleteMode)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 9 9"
							class="w-full stroke-current"
						>
							<path
								class="origin-center transition-transform"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="7"
								vector-effect="non-scaling-stroke"
								d="M2,2 L7,7 M7,2 L2,7"
							/>
						</svg>
					</button>
					<button
						class="btn btn-outline h-16 w-16"
						class:btn-active={addingDecal === 1}
						on:click={() => clickEmptySlot(1)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 9 9"
							class="w-full stroke-current"
						>
							<path
								class="origin-center transition-transform"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="7"
								vector-effect="non-scaling-stroke"
								d="M4.5,1.5 V7.5 M1.5,4.5 H7.5"
							/>
						</svg>
					</button>
				</li>
			{/if}
		</ul>
	</div>
	<div class="col-start-2">
		{#if $selectedSlot !== null || addingDecal !== null}
			<div class="rounded-box relative flex flex-col gap-4 bg-neutral px-3 py-4">
				<!-- <button
						class="btn-hover-grow btn btn-block h-16 px-0"
						class:selected-decal={decal.slot === $selectedSlot}
						on:click={() => clickDecalSlot(decal.slot)}
						on:mouseenter={() => hoveredSlot.set(decal.slot)}
						on:mouseleave={() => hoveredSlot.set(null)}
						on:focus={() => hoveredSlot.set(decal.slot)}
						on:blur={() => hoveredSlot.set(null)}
					></button> -->
				{#if addingDecal !== null}
					<ShapePicker onClick={addDecal} />
				{/if}
				{#if $selectedSlot !== null}
					<Controls slot={$selectedSlot} />
				{/if}
			</div>
		{/if}
		<!-- <div
			class="absolute left-0 top-0 z-50 h-[3px] w-[3px] rounded-sm bg-red-600"
			style:transform="translate({testDot.x - 1.5}px,{testDot.y - 1.5}px)"
		/> -->
	</div>
</section>

<style>
	.selected-decal {
		background-color: #605de9;
		border-color: #605de9;
	}
</style>
