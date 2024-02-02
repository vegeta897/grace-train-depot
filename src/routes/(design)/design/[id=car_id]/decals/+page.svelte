<script lang="ts">
	import { ContainerSvg, Decal, decalDefs } from 'grace-train-lib/components'
	import { DECAL_MAX_SCALE, DECAL_MAX_SLOTS } from '$lib/common/constants'
	import Controls from './Controls.svelte'
	import type { DecalDataWithId } from '$lib/server/schemas/decals'
	import DecalCanvas from './DecalCanvas.svelte'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../stores'
	import ShapePicker, { type DecalChoice } from './ShapePicker.svelte'
	import { COLOR_NAMES } from 'grace-train-lib'
	import { flip } from 'svelte/animate'
	import BoundingBox from '$lib/components/BoundingBox.svelte'
	import { browser } from '$app/environment'
	import { getDecalBoundingBox, removeDecal } from './decals'
	import { fade, fly } from 'svelte/transition'
	import { cloneDecal } from '$lib/car'

	const { localCars, designShortId, designCar, hints, updateDesignCar, setHint } =
		getDesignStores()
	const { hoveredSlot, selectedSlot, dirtyCanvas, snapping } = getDecalStores()

	// TODO: Allow choosing body color, to act as an "eraser" decal

	// TODO: Add randomize button (here and on other pages)
	// Changes shape, color, size, rotation, position, and params. Transition it if possible!

	// TODO: Avoid updating localCars until end of movement/rotation/scale/change
	// Likewise on other pages with rapid changes. Test perf!

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
			setHint('dragDecal', true)
		}
		updateDesignCar((car) => {
			car.decals.push(newDecal)
			car.decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			selectedSlot.set(newDecal.slot)
		})
	}

	function deleteDecal(slot: number) {
		removeDecal(localCars, $designShortId, slot)
		selectedSlot.set(null)
	}

	function duplicateDecal(slot: number) {
		const decal = $designCar.decals[slot]
		const decalCopy = cloneDecal(decal)
		decalCopy.slot = $designCar.decals.length
		decalCopy.id = Date.now()
		updateDesignCar((car) => {
			car.decals.push(decalCopy)
			selectedSlot.set(decalCopy.slot)
		})
	}

	function orderDecal(upOrDown: number) {
		if ($selectedSlot === null) return
		const decal = $designCar.decals[$selectedSlot]
		updateDesignCar((car) => {
			car.decals = car.decals.filter((_, i) => i !== $selectedSlot)
			car.decals.splice($selectedSlot! + upOrDown, 0, decal)
			car.decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			selectedSlot.set(decal.slot)
		})
	}

	const testDot = { x: 0, y: 0 } // Position a red dot on the page
</script>

<section class="flex w-full flex-col items-start gap-1 xs:gap-3 lg:flex-row">
	<div class="sticky top-0 z-10 w-full lg:relative lg:w-3/5">
		<div
			class="lg:remove-glass-bg glass-bg rounded-box overflow-clip bg-neutral"
			class:rounded-b-none={$selectedSlot !== null}
		>
			<DecalCanvas setTestDot={(x, y) => Object.assign(testDot, { x, y })} />
		</div>
		{#if $selectedSlot !== null}
			{@const slot = $selectedSlot}
			<div
				class="rounded-b-box flex w-full justify-between gap-1 bg-neutral p-1 xs:gap-2 xs:p-2"
			>
				<!-- TODO: Create icons for these -->
				<button
					on:click|preventDefault={() => snapping.set(!$snapping)}
					class="btn btn-square rounded-xl text-xl"
					class:btn-secondary={$snapping}>🧲</button
				>
				<button class="btn rounded-xl">something</button>
				<button
					on:click={() => duplicateDecal(slot)}
					class="btn btn-square ml-auto rounded-xl text-xl"
					disabled={$designCar.decals.length >= DECAL_MAX_SLOTS}>📋</button
				>
				<button
					on:click={() => deleteDecal(slot)}
					class="btn btn-square rounded-xl text-xl">🗑️</button
				>
			</div>
		{/if}
		{#if $hints.dragDecal}
			<div
				in:fly={{ duration: 150, y: -100 }}
				out:fade={{ duration: 150 }}
				class="alert alert-info mt-1 flex justify-between"
			>
				<p class="text-lg"><strong>hint:</strong> move decals by dragging!</p>
				<button
					class="btn btn-neutral lg:btn-sm"
					on:click={() => setHint('dragDecal', false)}>OK</button
				>
			</div>
		{/if}
	</div>
	<div class="flex w-full grow items-start gap-1 xs:gap-3 lg:w-1/2">
		{#if $designCar.decals.length > 0}
			<div class="rounded-box w-[3.25rem] bg-neutral">
				<button
					on:click={() => orderDecal(1)}
					class="btn rounded-box btn-sm btn-block h-10 touch-manipulation rounded-b-none"
					disabled={$selectedSlot === null ||
						$selectedSlot === $designCar.decals.length - 1}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 1 10 10"
						class="w-6 -scale-y-100 fill-none stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5,2 v7 l-2.5,-2.5 m2.5,2.5 l2.5,-2.5"
						/>
					</svg>
				</button>
				<ol class="flex flex-col-reverse justify-end p-1">
					{#each $designCar.decals as decal (decal.id)}
						{@const { width: bw, height: bh } = getDecalBoundingBox(decal)}
						{@const normalize = 80 / Math.max(bw, bh, 100)}
						{@const upscale =
							(Math.log((decal.scale - 0.5) / (DECAL_MAX_SCALE - 0.5) + 0.5) + 0.7) * 0.2}
						{@const params = { ...decal.params, extraThickness: 2 }}
						<li class="flex" animate:flip={{ duration: 150 }}>
							<button
								class="btn btn-ghost btn-sm size-11 touch-manipulation p-1 hover:bg-transparent"
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
				<button
					on:click={() => orderDecal(-1)}
					class="btn rounded-box btn-sm btn-block h-10 touch-manipulation rounded-t-none"
					disabled={$selectedSlot === null || $selectedSlot === 0}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 1 10 10"
						class="w-6 fill-none stroke-current"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5,2 v7 l-2.5,-2.5 m2.5,2.5 l2.5,-2.5"
						/>
					</svg>
				</button>
			</div>
		{/if}
		{#if browser}
			{@const noMoreDecals = $designCar.decals.length >= DECAL_MAX_SLOTS}
			<div class="relative grow" class:min-h-[180px]={noMoreDecals}>
				{#if $selectedSlot !== null}
					<Controls slot={$selectedSlot} />
				{:else}
					<ShapePicker onPick={addDecal} />
					{#if noMoreDecals}
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
