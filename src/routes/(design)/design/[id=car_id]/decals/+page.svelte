<script lang="ts">
	import { ContainerSvg, Decal, decalDefs } from 'grace-train-lib/components'
	import { DECAL_MAX_SLOTS } from '$lib/common/constants'
	import Controls from './Controls.svelte'
	import type { DecalDataWithId } from '$lib/server/schemas'
	import DecalCanvas from './DecalCanvas.svelte'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../stores'
	import ShapePicker, { type DecalChoice } from './ShapePicker.svelte'
	import { COLORS } from 'grace-train-lib'
	import { flip } from 'svelte/animate'
	import BoundingBox from './BoundingBox.svelte'
	import { browser } from '$app/environment'

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

	function clickDecalSlot(slot: number) {
		selectedSlot.set($selectedSlot === slot ? null : slot)
	}

	function addDecal(shape: DecalChoice) {
		if ($designCar.decals.length >= DECAL_MAX_SLOTS) return
		const newDecal = {
			name: shape.name,
			id: Date.now(),
			x: 375 / 2,
			y: 120,
			scale: 1,
			rotate: 0,
			fill: shape.fill || COLORS.POP[0],
			slot: 0, // Will be overwritten below
			params: {
				...decalDefs[shape.name].getDefaultParamsObject(),
				...shape.defaultParams,
			},
		} as DecalDataWithId
		localCars.update((cars) => {
			const decals = cars[$designShortId].decals
			decals.push(newDecal)
			decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			selectedSlot.set(newDecal.slot)
			return cars
		})
	}
	const testDot = { x: 0, y: 0 } // Position a red dot on the page
</script>

<section class="flex w-full flex-col items-start gap-3 lg:flex-row">
	<div
		class="lg:remove-glass-bg glass-bg rounded-box sticky top-0 z-10 w-full overflow-clip bg-neutral lg:relative lg:w-1/2"
	>
		<DecalCanvas
			car={$designCar}
			setTestDot={(x, y) => {
				testDot.x = x
				testDot.y = y
			}}
		/>
	</div>
	<div class="flex w-full flex-grow items-start gap-3 lg:w-1/2">
		{#if $designCar.decals.length > 0}
			<ul
				class="flex w-[3.25rem] flex-col-reverse justify-end gap-0.5 rounded-lg bg-neutral p-1"
			>
				{#each $designCar.decals as decal, d (decal.id)}
					<li class="flex" animate:flip={{ duration: 150 }}>
						<button
							class="btn btn-ghost btn-sm h-11 w-11 p-1 hover:bg-transparent"
							on:click={() => clickDecalSlot(decal.slot)}
							on:mouseenter={() => hoveredSlot.set(decal.slot)}
							on:mouseleave={() => hoveredSlot.set(null)}
							on:focus={() => hoveredSlot.set(decal.slot)}
							on:blur={() => hoveredSlot.set(null)}
						>
							<ContainerSvg viewBox="-50 -50 100 100" class="overflow-visible">
								<Decal
									name={decal.name}
									fill={decal.fill}
									params={decal.params}
									scale={0.7 + Math.log10(decal.scale) * 0.8}
									rotate={decal.rotate}
									transition={['fill', 'opacity']}
									animateAppear
								/>
								<BoundingBox
									scale={0.5}
									strokeWidthScale={0.75}
									faded={decal.slot !== $selectedSlot}
									hidden={decal.slot !== $selectedSlot && decal.slot !== $hoveredSlot}
									animate
								/>
							</ContainerSvg>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="rounded-box relative bg-neutral p-3">
			{#if browser}
				<div class="relative min-h-[220px] grow">
					{#if $selectedSlot !== null}
						<Controls slot={$selectedSlot} />
					{:else}
						{#if $designCar.decals.length === 0}
							<h3 class="mb-2 text-center text-2xl font-bold">Pick a decal!</h3>
						{/if}
						<ShapePicker onClick={addDecal} />
						{#if $designCar.decals.length >= DECAL_MAX_SLOTS}
							<div
								class="glass-bg rounded-box absolute left-0 top-0 h-full w-full bg-base-300 p-8 pt-14 text-center lg:p-14"
							>
								<h3 class="mb-2 text-3xl font-bold">
									You can't add more than {DECAL_MAX_SLOTS} decals!
								</h3>
								<p class="italic text-base-content/75">
									tell Vegeta if this limit is bad
								</p>
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<!-- <div
			class="absolute left-0 top-0 z-50 h-[3px] w-[3px] rounded-sm bg-red-600"
			style:transform="translate({testDot.x - 1.5}px,{testDot.y - 1.5}px)"
		/> -->
</section>
