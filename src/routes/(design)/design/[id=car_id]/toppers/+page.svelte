<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { getDesignStores } from '../stores'
	import type { TopperDataWithId } from '$lib/server/schemas'
	import {
		TOPPER_MAX_OFFSET,
		TOPPER_MAX_ROTATE,
		TOPPER_MAX_SCALE,
		TOPPER_MAX_SLOTS,
		TOPPER_MIN_SCALE,
	} from '$lib/common/constants'
	import { browser } from '$app/environment'
	import TopperPicker, { type TopperChoice } from './TopperPicker.svelte'
	import ColorSlider from '../ColorSlider.svelte'
	import { COLORS } from 'grace-train-lib'
	import { getCarViewBox } from '$lib/car'
	import Icon from '$lib/components/Icon.svelte'

	// TODO: Use "indicator" daisyUI class to indicate new/unique items

	const { designCar, localCars, designShortId } = getDesignStores()

	let selectedSlot: number | null = null
	let hoveredSlot: number | null = null
	let showFullCar = false

	$: selectedTopper = selectedSlot !== null ? $designCar.toppers[selectedSlot] : null

	function addTopper({ name, colors }: TopperChoice) {
		localCars.update((cars) => {
			const toppers = cars[$designShortId].toppers
			const slot = toppers.length
			cars[$designShortId].toppers.push({
				name,
				id: Date.now(),
				slot,
				colors,
				position:
					[0.15, 0.5, 0.85].find((p) =>
						toppers.every((t) => Math.abs(t.position - p) >= 0.25)
					) || 0.5,
				offset: 0,
				scale: 1,
				rotate: 0,
			})
			selectedSlot = slot
			return cars
		})
	}

	function removeTopper(slot: number) {
		localCars.update((cars) => {
			cars[$designShortId].toppers = cars[$designShortId].toppers.filter(
				(_, i) => i !== slot
			)
			cars[$designShortId].toppers.forEach((t, i) => (t.slot = i)) // Re-number slots
			selectedSlot = null
			return cars
		})
	}

	function setTopperProp<K extends keyof TopperDataWithId>(
		slot: number,
		prop: K,
		value: TopperDataWithId[K]
	) {
		localCars.update((cars) => {
			cars[$designShortId].toppers[slot][prop] = value
			return cars
		})
	}
</script>

<section
	class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row lg:items-start"
>
	<div class="sticky top-0 z-10 w-full lg:relative lg:w-1/2">
		<div
			class:aspect-4-3={!showFullCar}
			class="lg:remove-glass-bg glass-bg rounded-box overflow-clip bg-neutral p-4 lg:aspect-auto lg:p-6"
		>
			{#if browser}
				<DesignCar
					car={$designCar}
					bind:hoveredTopper={hoveredSlot}
					bind:selectedTopper={selectedSlot}
					viewBox={getCarViewBox($designCar, { top: -100 })}
					interactiveToppers
				/>
				<div class="absolute bottom-0 left-0 flex w-full justify-center pb-2 lg:hidden">
					<button
						on:click|preventDefault={() => (showFullCar = !showFullCar)}
						class="glass-bg btn btn-circle h-16 w-16 border-none !bg-opacity-60 p-4 text-3xl text-opacity-50 hover:!bg-opacity-80 hover:text-opacity-100"
					>
						<Icon icon={showFullCar ? 'upV' : 'downV'} />
					</button>
				</div>
			{/if}
		</div>
	</div>
	<div class="flex w-full items-start gap-1 xs:gap-3 lg:w-1/2">
		{#if selectedTopper}
			{@const topper = selectedTopper}
			<div class="rounded-box grow space-y-4 bg-neutral p-2 xs:p-4">
				<div class="grid grid-cols-[min-content_auto] items-center gap-x-3 gap-y-4">
					<label for="topperPosition" class="text-lg lg:text-xl"> place </label>
					<input
						name="topperPosition"
						type="range"
						min={0}
						max={1}
						step={1 / 400}
						value={topper.position}
						on:input={(e) =>
							setTopperProp(topper.slot, 'position', e.currentTarget.valueAsNumber)}
						class="range"
					/>
					<label for="topperOffset" class="text-lg lg:text-xl"> offset </label>
					<input
						name="topperOffset"
						type="range"
						min={-TOPPER_MAX_OFFSET}
						max={TOPPER_MAX_OFFSET}
						step="1"
						value={topper.offset}
						on:input={(e) =>
							setTopperProp(topper.slot, 'offset', e.currentTarget.valueAsNumber)}
						class="range"
					/>
					<label for="topperRotate" class="text-lg lg:text-xl"> tilt </label>
					<input
						name="topperRotate"
						type="range"
						min={-TOPPER_MAX_ROTATE}
						max={TOPPER_MAX_ROTATE}
						step="1"
						value={topper.rotate}
						on:input={(e) =>
							setTopperProp(topper.slot, 'rotate', e.currentTarget.valueAsNumber)}
						class="range range-secondary"
					/>
					<label for="topperScale" class="text-lg lg:text-xl"> size </label>
					<input
						name="topperScale"
						type="range"
						min={TOPPER_MIN_SCALE}
						max={TOPPER_MAX_SCALE}
						step="0.01"
						value={topper.scale}
						on:input={(e) =>
							setTopperProp(topper.slot, 'scale', e.currentTarget.valueAsNumber)}
						class="range range-primary"
					/>
					{#each topper.colors as color, i}
						<label for="topperColor{i + 1}" class="whitespace-nowrap text-lg lg:text-xl">
							color {i + 1}
						</label>
						<ColorSlider
							id="topperColor{i + 1}"
							{color}
							colors={COLORS.POP}
							onInput={() => {}}
						/>
					{/each}
				</div>
				<div class="grid gap-4 font-black sm:grid-cols-3">
					<button class="btn btn-block text-lg">Style</button>
					<button class="btn btn-block text-lg">🎲 Rando</button>
					<button
						on:click={() => removeTopper(topper.slot)}
						class="btn btn-block text-lg hover:btn-error md:text-2xl">🗑️</button
					>
				</div>
			</div>
		{:else}
			<div class="relative grow">
				{#if $designCar.toppers.length === 0}
					<h3 class="mb-2 text-center text-2xl font-bold">pick a topper!</h3>
				{/if}
				<TopperPicker onPick={addTopper} />
				{#if $designCar.toppers.length >= TOPPER_MAX_SLOTS}
					you can't add more than {TOPPER_MAX_SLOTS}&nbsp;toppers!
				{/if}
			</div>
		{/if}
	</div>
</section>
