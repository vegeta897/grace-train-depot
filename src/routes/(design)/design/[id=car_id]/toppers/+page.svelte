<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import {
		ContainerSvg,
		TOPPER_NAMES,
		Topper,
		type TopperName,
	} from 'grace-train-lib/components'
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

	// TODO: Use "indicator" daisyUI class to indicate new/unique items

	const { designCar, localCars, designShortId } = getDesignStores()

	let addingTopper = false
	let selectedSlot: number | null = null
	let hoveredSlot: number | null = null

	$: selectedTopper = selectedSlot !== null ? $designCar.toppers[selectedSlot] : null

	function clickEmptySlot() {
		addingTopper = true
		selectedSlot = null
	}

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
			addingTopper = false
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

	const scaleRange = TOPPER_MAX_SCALE - TOPPER_MIN_SCALE
	function rescaleTopperForButton(scale: number) {
		const normalized = (scale - TOPPER_MIN_SCALE) / scaleRange
		return 0.7 + normalized * 0.3
	}
</script>

<section
	class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row lg:items-start"
>
	<div class="p-4 lg:w-1/2 lg:p-6">
		{#if browser}
			<DesignCar
				car={$designCar}
				focusTopperSlot={hoveredSlot !== null ? hoveredSlot : null}
				viewBox={getCarViewBox($designCar)}
			/>
		{/if}
	</div>
	<div class="rounded-box flex flex-col gap-4 bg-neutral px-3 py-4 lg:w-1/2">
		<TopperPicker onPick={addTopper} />
		<ol class="flex h-16 justify-center gap-2">
			{#each $designCar.toppers as topper}
				<li class="w-20">
					<button
						class="btn-hover-grow btn btn-block h-16 px-0"
						class:selected-topper={topper.slot === selectedSlot}
						on:click={() =>
							(selectedSlot = selectedSlot === topper.slot ? null : topper.slot)}
						on:mouseenter={() => (hoveredSlot = topper.slot)}
						on:mouseleave={() => (hoveredSlot = null)}
						on:focus={() => (hoveredSlot = topper.slot)}
						on:blur={() => (hoveredSlot = null)}
					>
						<ContainerSvg class="h-8 w-8" viewBox="-50 -70 100 100">
							<Topper
								name={topper.name}
								rotate={topper.rotate}
								scale={rescaleTopperForButton(topper.scale)}
								topLine={[[0, topper.scale * 20]]}
								position={0}
								colors={['#79f800', '#00adf8']}
							/>
						</ContainerSvg>
					</button>
				</li>
			{/each}
			{#if $designCar.toppers.length < TOPPER_MAX_SLOTS}
				(picker)
			{:else}
				you have enough hats!
			{/if}
		</ol>
		{#if addingTopper}
			<div class="mb-4 grid grid-cols-3 gap-3 font-black lg:grid-cols-4">
				{#each TOPPER_NAMES as name}
					<!-- <button
						class="btn btn-block flex h-24 flex-col justify-center gap-2 text-xl normal-case lg:h-28 lg:gap-4"
						on:click={() => addTopper(name)}
					>
						<ContainerSvg class="h-8 w-8" viewBox="-50 -120 100 100">
							<Topper
								{name}
								topLine={[[0, 0]]}
								position={0}
								colors={['#79f800', '#00adf8']}
							/>
						</ContainerSvg>
						{name}
					</button> -->
				{/each}
			</div>
		{/if}
		{#if selectedTopper}
			{@const topper = selectedTopper}
			<div class="mb-2 grid grid-cols-1 gap-x-8 gap-y-2 lg:grid-cols-2">
				<div class="form-control">
					<label for="topperPosition" class="label">
						<span class="label-text text-lg">place</span>
					</label>
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
				</div>
				<div class="form-control">
					<label for="topperOffset" class="label">
						<span class="label-text text-lg">offset</span>
					</label>
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
				</div>
				<div class="form-control">
					<label for="topperRotate" class="label">
						<span class="label-text text-lg">tilt</span>
					</label>
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
				</div>
				<div class="form-control">
					<label for="topperScale" class="label">
						<span class="label-text text-lg">size</span>
					</label>
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
				</div>
				{#each topper.colors as color, i}
					<div class="form-control">
						<label for="topperColor{i + 1}" class="label">
							<span class="label-text text-lg">color {i + 1}</span>
						</label>
						<ColorSlider
							id="topperColor{i + 1}"
							{color}
							colors={COLORS.POP}
							onInput={() => {}}
						/>
					</div>
				{/each}
			</div>
			<div class="grid gap-4 font-black sm:grid-cols-3">
				<button class="btn btn-block text-lg font-black tracking-wide">Style</button>
				<button class="btn btn-block text-lg font-black tracking-wide">🎲 Rando</button>
				<button
					on:click={() => removeTopper(topper.slot)}
					class="btn btn-block text-lg hover:btn-error md:text-2xl">🗑️</button
				>
			</div>
		{/if}
	</div>
</section>

<style>
	.selected-topper {
		background-color: #605de9;
		border-color: #605de9;
	}
</style>
