<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { getDesignStores, setHint } from '../stores'
	import type { TopperDataWithId } from '$lib/server/schemas/toppers'
	import {
		TOPPER_MAX_OFFSET,
		TOPPER_MAX_ROTATE,
		TOPPER_MAX_SCALE,
		TOPPER_MAX_SLOTS,
		TOPPER_MIN_SCALE,
	} from '$lib/common/constants'
	import { browser } from '$app/environment'
	import TopperPicker, { type TopperChoice } from './TopperPicker.svelte'
	import { boundsToViewbox, getCarBounds } from '$lib/car'
	import Icon from '$lib/components/Icon.svelte'
	import { Topper, bodyDefs, topperDefs } from 'grace-train-lib/components'
	import ParamControls from '../ParamControls.svelte'
	import BoundingBox from '$lib/components/BoundingBox.svelte'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { fade, fly } from 'svelte/transition'

	// TODO: Use "indicator" daisyUI class to indicate new/unique items

	const { designCar, localCars, designShortId, hints } = getDesignStores()

	let selectedSlot: number | null = null
	let hoveredSlot: number | null = null
	let showFullCar = false
	let canvasContainer: HTMLDivElement
	let carSVGwidth: number
	let clickOutsideCooldown = false

	$: topperLine = bodyDefs[$designCar.body].topperLine
	$: topperLineStartX = topperLine[0][0]
	$: topperLineEndX = topperLine[topperLine.length - 1][0]
	$: topperLineWidth = topperLineEndX - topperLineStartX
	$: carBounds = getCarBounds($designCar, { left: -10, right: 385, top: -100 })
	$: carWidthRatio = (carBounds.right - carBounds.left) / carSVGwidth

	$: selectedTopper = selectedSlot !== null ? $designCar.toppers[selectedSlot] : null

	function addTopper({ name, params }: TopperChoice) {
		localCars.update((cars) => {
			const toppers = cars[$designShortId].toppers
			const slot = toppers.length
			if ($hints.dragTopper === undefined && cars[$designShortId].toppers.length === 0) {
				setHint(hints, 'dragTopper', true)
			}
			cars[$designShortId].toppers.push({
				name,
				id: Date.now(),
				slot,
				params: {
					...topperDefs[name].getDefaultParamsObject(),
					...params,
				},
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

	function setTopperParam(name: string, value: number | boolean | string) {
		localCars.update((cars) => {
			cars[$designShortId].toppers[selectedSlot!].params[name] = value
			return cars
		})
	}

	let dragging: { slot: number; x: number; position: number } | null = null

	function onTopperDragStart(slot: number, { clientX: x }: PointerEvent) {
		selectedSlot = slot
		dragging = { slot, x, position: $designCar.toppers[slot].position }
	}
	function onPointerMove(e: PointerEvent) {
		if (!dragging) return
		e.preventDefault()
		const normalizedX = ((e.clientX - dragging.x) * carWidthRatio) / topperLineWidth
		const newPosition = Math.max(0, Math.min(1, dragging.position + normalizedX))
		localCars.update((cars) => {
			cars[$designShortId].toppers[dragging!.slot].position = newPosition
			return cars
		})
	}
	function onPointerUp() {
		if (!dragging) return
		setHint(hints, 'dragTopper', false)
		dragging = null
		clickOutsideCooldown = true
		setTimeout(() => (clickOutsideCooldown = false), 100)
	}
</script>

<svelte:window on:pointermove={onPointerMove} on:pointerup={onPointerUp} />
<section
	class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row lg:items-start"
>
	<div class="sticky top-0 z-10 w-full space-y-1 lg:relative lg:w-1/2">
		<div
			class:aspect-4-3={!showFullCar}
			class="lg:remove-glass-bg glass-bg rounded-box touch-none overflow-clip bg-neutral p-4 lg:aspect-auto lg:p-6"
			bind:this={canvasContainer}
		>
			{#if browser}
				<DesignCar
					car={$designCar}
					bind:svgWidth={carSVGwidth}
					viewBox={boundsToViewbox(carBounds)}
				>
					<svelte:fragment slot="toppers" let:topLine>
						{#each $designCar.toppers as { id, slot, name, params, position, offset, scale, rotate }, t (id)}
							{@const topperData = { name, params, position, offset, scale, rotate }}
							<g
								class=" cursor-ew-resize select-none outline-none"
								on:click={() => (selectedSlot = t)}
								use:clickoutside={{
									limit: { parent: canvasContainer },
									enabled: !clickOutsideCooldown,
								}}
								on:clickoutside={() => (selectedSlot = null)}
								on:pointerenter={() => {
									if (!dragging) hoveredSlot = t
								}}
								on:pointerleave={() => (hoveredSlot = null)}
								on:keypress
								on:pointerdown|preventDefault={(e) => onTopperDragStart(slot, e)}
								role="button"
								tabindex={t + 1}
							>
								<Topper {topLine} {...topperData}>
									{#if slot === selectedSlot || slot === hoveredSlot}
										{@const { width, height } = topperDefs[name].getBoundingBox()}
										<BoundingBox
											padding={5}
											centered={false}
											{width}
											{height}
											faded={slot !== selectedSlot}
											{scale}
										/>
									{/if}
								</Topper>
							</g>
						{/each}
					</svelte:fragment>
				</DesignCar>
				<div class="absolute bottom-0 left-0 flex w-full justify-center pb-2 lg:hidden">
					<button
						on:click|preventDefault={() => (showFullCar = !showFullCar)}
						class="glass-bg btn btn-circle h-16 w-16 border-none !bg-opacity-60 p-4 text-3xl text-opacity-50 hover:!bg-opacity-80 hover:text-opacity-100"
					>
						<Icon class="w-full" icon={showFullCar ? 'upV' : 'downV'} />
					</button>
				</div>
			{/if}
		</div>
		{#if $hints.dragTopper}
			<div
				in:fly={{ duration: 150, y: -100 }}
				out:fade={{ duration: 150 }}
				class="alert alert-info flex justify-between"
			>
				<p class="text-lg">
					<strong>hint:</strong> move toppers by dragging!
				</p>
				<button
					class="btn btn-neutral lg:btn-sm"
					on:click={() => setHint(hints, 'dragTopper', false)}>OK</button
				>
			</div>
		{/if}
	</div>
	<div class="flex w-full items-start gap-1 xs:gap-3 lg:w-1/2">
		{#if selectedTopper}
			{@const topper = selectedTopper}
			<div class="rounded-box grow space-y-4 bg-neutral p-2 xs:p-4">
				<div class="grid grid-cols-[min-content_auto] items-center gap-x-3 gap-y-4">
					<label for="topperPosition" class="text-lg lg:text-xl">place</label>
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
					<label for="topperOffset" class="text-lg lg:text-xl">offset</label>
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
					<label for="topperScale" class="text-lg lg:text-xl">size</label>
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
					<label for="topperRotate" class="text-lg lg:text-xl">tilt</label>
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
					<ParamControls
						object={{ type: 'topper', data: topper, def: topperDefs[topper.name] }}
						onInput={setTopperParam}
					/>
				</div>
				<div class="grid grid-cols-2 gap-2 font-black">
					<button class="btn btn-block text-lg">Change</button>
					<button class="btn btn-block text-lg">🎲 Rando</button>
					<button
						on:click={() => removeTopper(topper.slot)}
						class="btn btn-block text-lg hover:btn-error">🗑️ Delete</button
					>
					<button class="btn btn-block text-lg" on:click={() => (selectedSlot = null)}
						>Done</button
					>
				</div>
			</div>
		{:else if browser}
			<div
				class="relative grow"
				class:min-h-[180px]={$designCar.toppers.length >= TOPPER_MAX_SLOTS}
			>
				{#if $designCar.toppers.length === 0}
					<h3 class="mb-2 text-center text-2xl font-bold">pick a topper!</h3>
				{/if}
				<TopperPicker onPick={addTopper} />
				{#if $designCar.toppers.length >= TOPPER_MAX_SLOTS}
					<div
						class="glass-bg rounded-box absolute left-0 top-0 flex h-full w-full flex-col justify-center bg-base-300 p-6 text-center"
					>
						<h3 class="mb-2 text-xl font-bold xs:text-2xl">
							you can't add more than {TOPPER_MAX_SLOTS}&nbsp;toppers!
						</h3>
						<p class="text-sm italic text-base-content/75 xs:text-base">
							tell vegeta if this limit should be higher
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>
