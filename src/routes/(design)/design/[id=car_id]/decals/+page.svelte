<script lang="ts">
	import { ContainerSvg, Decal, decalDefs } from 'grace-train-lib/components'
	import { DECAL_MAX_SCALE, DECAL_MAX_SLOTS } from '$lib/common/constants'
	import Controls from './Controls.svelte'
	import type { DecalDataWithId } from '$lib/server/schemas'
	import DecalCanvas from './DecalCanvas.svelte'
	import { getDecalStores } from './stores'
	import { getDesignStores, setHint } from '../stores'
	import ShapePicker, { type DecalChoice } from './ShapePicker.svelte'
	import { COLOR_NAMES } from 'grace-train-lib'
	import { flip } from 'svelte/animate'
	import BoundingBox from '$lib/components/BoundingBox.svelte'
	import { browser } from '$app/environment'
	import { getDecalBoundingBox } from './decals'
	import { fade, fly } from 'svelte/transition'

	const { localCars, designShortId, designCar, hints } = getDesignStores()
	const { hoveredSlot, selectedSlot, dirtyCanvas } = getDecalStores()

	// TODO: Allow choosing body color to act as an "eraser" decal

	// TODO: Add randomize button (here and on other pages)
	// Changes shape, color, size, rotation, position, and params. Transition it if possible!

	// TODO: Add keyboard shortcuts (delete, arrows, etc) see svelte-put shortcuts module

	// TODO: Add a toast to discourage adding too many decals

	hoveredSlot.set(null)
	selectedSlot.set(null)

	function clickDecalSlot(slot: number) {
		selectedSlot.set($selectedSlot === slot ? null : slot)
		dirtyCanvas.set(true)
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
			fill: shape.fill || COLOR_NAMES.POP.POP,
			slot: 0, // Will be overwritten below
			params: {
				...decalDefs[shape.name].getDefaultParamsObject(),
				...shape.params,
			},
		} as DecalDataWithId
		if ($hints.dragDecal === undefined && $designCar.decals.length === 0) {
			setHint(hints, 'dragDecal', true)
		}
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

<section class="flex w-full flex-col items-start gap-1 xs:gap-3 lg:flex-row">
	<div class="sticky top-0 z-10 w-full space-y-1 lg:relative lg:w-1/2">
		<div class="lg:remove-glass-bg glass-bg rounded-box overflow-clip bg-neutral">
			<DecalCanvas setTestDot={(x, y) => Object.assign(testDot, { x, y })} />
		</div>
		{#if $hints.dragDecal}
			<div
				in:fly={{ duration: 150, y: -100 }}
				out:fade={{ duration: 150 }}
				class="alert alert-info flex justify-between"
			>
				<p class="text-lg"><strong>hint:</strong> move decals by dragging!</p>
				<button
					class="btn btn-neutral lg:btn-sm"
					on:click={() => setHint(hints, 'dragDecal', false)}>OK</button
				>
			</div>
		{/if}
	</div>
	<div class="flex w-full grow items-start gap-1 xs:gap-3 lg:w-1/2">
		{#if $designCar.decals.length > 0}
			<ol class="flex w-[3.25rem] flex-col-reverse justify-end rounded-lg bg-neutral p-1">
				{#each $designCar.decals as decal (decal.id)}
					{@const { width: bw, height: bh } = getDecalBoundingBox(decal)}
					{@const normalize = 80 / Math.max(bw, bh, 100)}
					{@const upscale =
						(Math.log((decal.scale - 0.5) / (DECAL_MAX_SCALE - 0.5) + 0.5) + 0.7) * 0.2}
					{@const params = { ...decal.params, extraThickness: 2 }}
					<li class="flex" animate:flip={{ duration: 150 }}>
						<button
							class="btn btn-ghost btn-sm h-11 w-11 touch-manipulation p-1 hover:bg-transparent"
							on:click={() => clickDecalSlot(decal.slot)}
							on:pointerenter={() => hoveredSlot.set(decal.slot)}
							on:pointerleave={() => hoveredSlot.set(null)}
							on:focus={() => hoveredSlot.set(decal.slot)}
							on:blur={() => hoveredSlot.set(null)}
						>
							<ContainerSvg viewBox="-50 -50 100 100" class="overflow-visible">
								<g transform="scale({(normalize + upscale) / decal.scale})">
									<Decal
										name={decal.name}
										fill={decal.fill}
										{params}
										scale={decal.scale}
										rotate={decal.rotate}
										transition={['fill', 'opacity']}
										animateAppear
									/>
								</g>
								<BoundingBox
									scale={1}
									strokeWidthScale={1.5}
									faded={decal.slot !== $selectedSlot}
									hidden={decal.slot !== $selectedSlot && decal.slot !== $hoveredSlot}
									fullHitbox
								/>
							</ContainerSvg>
						</button>
					</li>
				{/each}
			</ol>
		{/if}
		{#if browser}
			<div
				class="relative grow"
				class:min-h-[180px]={$designCar.decals.length >= DECAL_MAX_SLOTS}
			>
				{#if $selectedSlot !== null}
					<Controls slot={$selectedSlot} />
				{:else}
					{#if $designCar.decals.length === 0}
						<h3 class="mb-2 text-center text-2xl font-bold">pick a decal!</h3>
					{/if}
					<ShapePicker onPick={addDecal} />
					{#if $designCar.decals.length >= DECAL_MAX_SLOTS}
						<div
							class="glass-bg rounded-box absolute left-0 top-0 flex h-full w-full flex-col justify-center bg-base-300 p-6 text-center"
						>
							<h3 class="mb-2 text-xl font-bold xs:text-2xl">
								you can't add more than {DECAL_MAX_SLOTS}&nbsp;decals!
							</h3>
							<p class="text-sm italic text-base-content/75 xs:text-base">
								tell vegeta if this limit should be higher
							</p>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
	<!-- <div
		id="testDot"
		class="absolute left-0 top-0 z-50 h-[3px] w-[3px] rounded-sm bg-red-600"
		style:transform="translate({testDot.x - 1.5}px,{testDot.y - 1.5}px)"
	/> -->
</section>
