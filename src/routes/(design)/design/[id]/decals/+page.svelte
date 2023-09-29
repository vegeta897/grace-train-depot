<script lang="ts">
	import { ContainerSvg, Decal, type DecalName } from 'grace-train-lib/components'
	import { DECAL_MAX_SLOTS } from '$lib/common/constants'
	import Controls from './Controls.svelte'
	import type { DecalDataWithId } from '$lib/server/schemas'
	import DecalCanvas from './DecalCanvas.svelte'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../../stores'
	import ShapePicker from './ShapePicker.svelte'
	import { COLORS } from 'grace-train-lib'

	const { localCars, designShortId, designCar } = getDesignStores()
	const { hoveredSlot, selectedSlot } = getDecalStores()

	// TODO: Prototype a "sliders" mode where x/y/scale/rotate can be set with sliders on one page
	// Could even adjust decal order/slot with a slider! Embrace the sliders!

	// TODO: Add sliders and checkboxes to tweak decal shape/proportions
	// Like star pointiness, number of points, fill vs outline, etc
	// More fun to design/program, more fun to play with
	// TODO: Use JSON data type to store these custom props since they differ between decals

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
			transform: { x: 375 / 2, y: 120, scale: 1, rotate: 0 },
			fill: '', // Will be overwritten below
			slot: 0, // Will be overwritten below
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

	// const testDot = { x: -9, y: -9 } // Position a red dot on the page
</script>

<section>
	<div
		class="sticky top-0 z-10 bg-base-100"
		style:-webkit-backdrop-filter="blur(6px)"
		style:backdrop-filter="blur(6px)"
		style:--tw-bg-opacity="0.8"
	>
		<DecalCanvas car={$designCar} />
	</div>
	<div class="rounded-box flex flex-col gap-4 bg-neutral px-3 py-4">
		<ol
			class="flex h-16 justify-center gap-2"
			class:max-sm:gap-1={$designCar.decals.length >= 3}
		>
			{#if $designCar.decals.length < DECAL_MAX_SLOTS - 1 && $designCar.decals.length > 0}
				<li class="w-20">
					<button
						class="btn btn-outline btn-block h-16 px-0 text-4xl font-black"
						class:btn-active={addingDecal === -1}
						on:click={() => clickEmptySlot(-1)}>+</button
					>
				</li>
			{/if}
			{#each $designCar.decals as decal}
				<li class="w-28 shrink">
					<button
						class="btn-hover-grow btn btn-block h-16 px-0"
						class:selected-decal={decal.slot === $selectedSlot}
						on:click={() => clickDecalSlot(decal.slot)}
						on:mouseenter={() => hoveredSlot.set(decal.slot)}
						on:mouseleave={() => hoveredSlot.set(null)}
						on:focus={() => hoveredSlot.set(decal.slot)}
						on:blur={() => hoveredSlot.set(null)}
					>
						<ContainerSvg
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
						</ContainerSvg>
					</button>
				</li>
			{/each}
			{#if $designCar.decals.length < DECAL_MAX_SLOTS}
				<li class="w-20">
					<button
						class="btn btn-outline btn-block h-16 px-0 text-4xl font-black"
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
		background-color: #605de9;
		border-color: #605de9;
	}
</style>
