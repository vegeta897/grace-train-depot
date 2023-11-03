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
		if (addingDecal === null || $designCar.decals.length >= DECAL_MAX_SLOTS) return
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

<section class="flex w-full flex-col items-start gap-4 lg:flex-row">
	<div
		class="lg:remove-glass-bg glass-bg rounded-box sticky top-0 z-10 w-full bg-neutral lg:relative lg:w-1/2"
	>
		<DecalCanvas
			car={$designCar}
			setTestDot={(x, y) => {
				testDot.x = x
				testDot.y = y
			}}
		/>
	</div>
	<!-- <ul class="rounded-box flex flex-col-reverse justify-end gap-2 bg-neutral p-3">
			{#each $designCar.decals as decal, d}
				<li class="flex lg:h-16">
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
				</li>
			{/each}
		</ul> -->
	<div
		class="rounded-box relative min-h-[220px] w-full flex-grow bg-neutral p-3 lg:w-1/2"
	>
		<!-- <button
							class="btn-hover-grow btn btn-block h-16 px-0"
							class:selected-decal={decal.slot === $selectedSlot}
							on:click={() => clickDecalSlot(decal.slot)}
							on:mouseenter={() => hoveredSlot.set(decal.slot)}
							on:mouseleave={() => hoveredSlot.set(null)}
							on:focus={() => hoveredSlot.set(decal.slot)}
							on:blur={() => hoveredSlot.set(null)}
						></button> -->
		{#if $selectedSlot !== null}
			<Controls slot={$selectedSlot} />
		{:else}
			<div class="form-control">
				<label class="label cursor-pointer">
					<span class="label-text">Add behind</span>
					<input type="checkbox" class="toggle" checked />
					<span class="label-text">Add in front</span>
				</label>
			</div>
			<ShapePicker onClick={addDecal} />
			{#if $designCar.decals.length >= DECAL_MAX_SLOTS}
				<div
					class="glass-bg rounded-box absolute left-0 top-0 h-full w-full bg-base-300 p-8 pt-14 text-center lg:p-14"
				>
					<h3 class="mb-2 text-3xl font-bold">
						You can't add more than {DECAL_MAX_SLOTS} decals!
					</h3>
					<p class="italic text-base-content/75">tell Vegeta if this limit is bad</p>
				</div>
			{/if}
		{/if}
		<!-- <div
				class="absolute left-0 top-0 z-50 h-[3px] w-[3px] rounded-sm bg-red-600"
				style:transform="translate({testDot.x - 1.5}px,{testDot.y - 1.5}px)"
			/> -->
	</div>
</section>
