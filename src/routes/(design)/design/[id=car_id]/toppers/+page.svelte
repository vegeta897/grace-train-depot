<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { getDesignStores } from '../stores'
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
	import {
		Topper,
		bodyDefs,
		topperDefs,
		type TopperDef,
	} from 'grace-train-lib/components'
	import ParamControls from '../ParamControls.svelte'
	import BoundingBox from '$lib/components/BoundingBox.svelte'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { fade, fly } from 'svelte/transition'

	// TODO: Use "indicator" daisyUI class to indicate new/unique items

	const { designCar, hints, updateDesignCar, setHint } = getDesignStores()

	let selectedSlot: number | null = null
	let hoveredSlot: number | null = null
	let showFullCar = false
	let canvasContainer: HTMLDivElement
	let carSVGwidth: number
	let clickOutsideCooldown = false

	$: topperLineWidth = bodyDefs[$designCar.body].topperLine.width
	$: carBounds = getCarBounds($designCar, { left: -40, right: 415, top: -120 })
	$: carWidthRatio = (carBounds.right - carBounds.left) / carSVGwidth

	$: selectedTopper = selectedSlot !== null ? $designCar.toppers[selectedSlot] : null

	function addTopper({ name, params }: TopperChoice) {
		updateDesignCar((car) => {
			const toppers = car.toppers
			const slot = toppers.length
			if ($hints.dragTopper === undefined && car.toppers.length === 0) {
				setHint('dragTopper', true)
			}
			car.toppers.push({
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
		})
	}

	function removeTopper(slot: number) {
		updateDesignCar((car) => {
			car.toppers = car.toppers.filter((_, i) => i !== slot)
			car.toppers.forEach((t, i) => (t.slot = i)) // Re-number slots
			selectedSlot = null
		})
	}

	function setTopperProp<K extends keyof TopperDataWithId>(
		slot: number,
		prop: K,
		value: TopperDataWithId[K]
	) {
		updateDesignCar((car) => {
			car.toppers[slot][prop] = value
		})
	}

	function setTopperParam(name: string, value: number | boolean | string) {
		updateDesignCar((car) => {
			car.toppers[selectedSlot!].params[name] = value
		})
	}

	let dragging: {
		slot: number
		x: number
		position: number
		scale: number
		def: TopperDef
	} | null = null

	function onTopperDragStart(slot: number, { clientX: x }: PointerEvent) {
		selectedSlot = slot
		const topper = $designCar.toppers[slot]
		dragging = {
			slot,
			x,
			position: topper.position,
			scale: topper.scale,
			def: topperDefs[topper.name],
		}
	}
	function onPointerMove(e: PointerEvent) {
		if (!dragging) return
		e.preventDefault()
		const normalizedX =
			((e.clientX - dragging.x) * carWidthRatio) /
			(topperLineWidth - dragging.def.pivots.width * dragging.scale)
		const newPosition = Math.max(0, Math.min(1, dragging.position + normalizedX))
		updateDesignCar((car) => {
			car.toppers[dragging!.slot].position = Math.round(newPosition * 400) / 400
		})
	}
	function onPointerUp() {
		if (!dragging) return
		setHint('dragTopper', false)
		dragging = null
		clickOutsideCooldown = true
		setTimeout(() => (clickOutsideCooldown = false), 100)
	}
	function onKeyDown(event: KeyboardEvent) {
		if (selectedSlot === null) return
		if (event.key === 'Delete') {
			removeTopper(selectedSlot)
			selectedSlot = null
			return
		}
		if (event.key === 'Escape') {
			selectedSlot = null
			return
		}
		let nudgedPosition = $designCar.toppers[selectedSlot].position
		const nudgeDistance = event.shiftKey ? 0.05 : 0.0025
		switch (event.key) {
			case 'ArrowLeft':
				nudgedPosition -= nudgeDistance
				break
			case 'ArrowRight':
				nudgedPosition += nudgeDistance
				break
		}
		updateDesignCar((car) => {
			car.toppers[selectedSlot!].position = Math.max(0, Math.min(1, nudgedPosition))
		})
	}
</script>

<svelte:window
	on:pointermove={onPointerMove}
	on:pointerup={onPointerUp}
	on:keydown={onKeyDown}
/>
<section
	class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row lg:items-start"
>
	<!-- TODO: Add title and close button, like on decals page -->
	<div class="sticky top-0 z-10 w-full space-y-1 lg:relative lg:w-3/5">
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
								class="cursor-ew-resize select-none outline-none"
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
						class="glass-bg btn btn-circle size-16 border-none !bg-opacity-60 p-4 text-3xl text-opacity-50 hover:!bg-opacity-80 hover:text-opacity-100"
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
					on:click={() => setHint('dragTopper', false)}>OK</button
				>
			</div>
		{/if}
	</div>
	<div class="flex w-full items-start gap-1 xs:gap-3 lg:w-1/2">
		{#if selectedTopper}
			{@const topper = selectedTopper}
			<div class="rounded-box grow space-y-4 bg-neutral p-2 xs:p-6">
				<div class="grid grid-cols-[min-content_auto] items-center gap-x-3 gap-y-4">
					<label for="topperPosition" class="text-lg text-base-content/80 lg:text-xl"
						>place</label
					>
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
					<label for="topperOffset" class="text-lg text-base-content/80 lg:text-xl"
						>offset</label
					>
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
					<label for="topperScale" class="text-lg text-base-content/80 lg:text-xl"
						>size</label
					>
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
					<label for="topperRotate" class="text-lg text-base-content/80 lg:text-xl"
						>tilt</label
					>
					<input
						name="topperRotate"
						type="range"
						min={-TOPPER_MAX_ROTATE}
						max={TOPPER_MAX_ROTATE}
						step="0.1"
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
					<button class="btn btn-block text-lg">Swap</button>
					<button class="btn btn-block text-lg">Randomize</button>
					<button
						on:click={() => removeTopper(topper.slot)}
						class="btn btn-block text-lg hover:btn-error">Delete</button
					>
					<button class="btn btn-block text-lg" on:click={() => (selectedSlot = null)}
						>Done</button
					>
				</div>
			</div>
		{:else if browser}
			{@const noMoreToppers = $designCar.toppers.length >= TOPPER_MAX_SLOTS}
			<div class="relative grow" class:min-h-[180px]={noMoreToppers}>
				<TopperPicker onPick={addTopper} />
				{#if noMoreToppers}
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
