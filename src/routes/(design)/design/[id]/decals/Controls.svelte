<script lang="ts">
	import type { DecalName } from 'grace-train-lib'
	import { POP_COLORS, DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { updateDecalTransform } from './decals'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../../stores'
	import ShapePicker from './ShapePicker.svelte'
	import ColorSlider from '../../ColorSlider.svelte'

	export let slot: number

	const { localCars, designCar, designShortId } = getDesignStores()
	const { selectedSlot } = getDecalStores()

	$: decal = $designCar.decals[slot]

	let toolMode: null | 'shape' | 'color' | 'scale' | 'rotate' = null

	const setToolMode = (mode: typeof toolMode) =>
		(toolMode = toolMode === mode ? null : mode)

	function removeDecal() {
		localCars.update((cars) => {
			cars[$designShortId].decals = cars[$designShortId].decals.filter(
				(_, i) => i !== slot
			)
			cars[$designShortId].decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			selectedSlot.set(null)
			return cars
		})
	}

	function orderDecal(upOrDown: number) {
		const decal = $designCar.decals[slot]
		localCars.update((cars) => {
			cars[$designShortId].decals = cars[$designShortId].decals.filter(
				(_, i) => i !== slot
			)
			cars[$designShortId].decals.splice(slot + upOrDown, 0, decal)
			cars[$designShortId].decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			selectedSlot.set(decal.slot)
			return cars
		})
	}

	function setDecalShape(name: DecalName) {
		localCars.update((cars) => {
			cars[$designShortId].decals[slot].name = name
			return cars
		})
		toolMode = null
	}

	function setDecalColor(color: string) {
		localCars.update((cars) => {
			cars[$designShortId].decals[slot].fill = color
			return cars
		})
		// toolMode = null
	}

	function previewDecalColor(color?: string) {
		localCars.update((cars) => {
			if (color) {
				cars[$designShortId].decals[slot].fillPreview = color
			} else {
				delete cars[$designShortId].decals[slot].fillPreview
			}
			return cars
		})
	}
</script>

<div class="grid grid-cols-4 gap-2 gap-y-3">
	<button
		on:click={() => setToolMode('scale')}
		class="font-black btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		class:text-primary={toolMode !== 'scale'}
		class:btn-primary={toolMode === 'scale'}
	>
		Size
	</button>
	<button
		on:click={() => setToolMode('rotate')}
		class="font-black btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		class:text-secondary={toolMode !== 'rotate'}
		class:btn-secondary={toolMode === 'rotate'}
	>
		Spin
	</button>
	<button
		on:click={() => setToolMode('shape')}
		class="font-black btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		class:btn-active={toolMode === 'shape'}
	>
		Shape
	</button>
	{#if toolMode !== 'color'}
		<button
			on:click={() => setToolMode('color')}
			class="font-black btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
			style:color={$designCar.decals[slot].fill}
		>
			Color
		</button>
	{:else}
		<button
			on:click={() => setToolMode('color')}
			class="font-black btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
			style:background={$designCar.decals[slot].fill}
			style:color="hsl(var(--inc))"
		>
			Color
		</button>
	{/if}
	{#if toolMode === null}
		<button
			on:click={() => removeDecal()}
			class="btn btn-md touch-manipulation text-2xl hover:btn-error md:text-3xl"
			>🗑️</button
		>

		<button
			on:click={() => orderDecal(-1)}
			disabled={slot === 0}
			class="font-black btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		>
			Push
		</button>
		<button
			on:click={() => orderDecal(1)}
			disabled={slot === $designCar.decals.length - 1}
			class="font-black btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		>
			Pull
		</button>
	{:else if toolMode === 'shape'}
		<ShapePicker fill={$designCar.decals[slot].fill} onClick={setDecalShape} />
	{:else if toolMode === 'color'}
		<div class="col-span-4 flex flex-col justify-center gap-3 px-2">
			<ColorSlider
				colors={POP_COLORS}
				color={decal.fill}
				onInput={(e) => setDecalColor(POP_COLORS[+e.currentTarget.value])}
			/>
			Mix (gradient to neighbor color)
			<input type="range" min={-2} max={2} step="1" value={0} class="range" />
			Direction (rotate +/- 180) (or just a flip checkbox, other angles might clash)
			<input type="range" min={-180} max={180} step="1" value={0} class="range" />
		</div>
	{:else if toolMode === 'scale'}
		<div class="col-span-4 flex h-16 flex-col justify-center px-2">
			<input
				type="range"
				min={DECAL_MIN_SCALE}
				max={DECAL_MAX_SCALE}
				step="0.05"
				value={decal.transform.scale}
				on:input={(e) => {
					decal.transform.scale = +e.currentTarget.value
					updateDecalTransform(localCars, $designShortId, slot, decal.transform)
				}}
				class="range range-primary"
			/>
		</div>
	{:else if toolMode === 'rotate'}
		<div class="col-span-4 flex h-16 flex-col justify-center px-2">
			<input
				type="range"
				min={-180}
				max={180}
				step="1"
				value={decal.transform.rotate}
				on:input={(e) => {
					decal.transform.rotate = +e.currentTarget.value
					updateDecalTransform(localCars, $designShortId, slot, decal.transform)
				}}
				class="range range-secondary"
			/>
		</div>
	{/if}
</div>
