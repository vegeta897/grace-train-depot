<script lang="ts">
	import type { DecalName } from 'grace-train-lib/components'
	import { DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { updateDecalTransform } from './decals'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../../stores'
	import ShapePicker from './ShapePicker.svelte'
	import ColorSlider from '../../ColorSlider.svelte'
	import { COLORS } from 'grace-train-lib'

	export let slot: number

	const { localCars, designCar, designShortId } = getDesignStores()
	const { selectedSlot } = getDecalStores()

	$: decal = $designCar.decals[slot]

	let toolMode: null | 'shape' = null

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

	function setDecalParam(pIndex: number, value: number | boolean) {
		localCars.update((cars) => {
			cars[$designShortId].decals[slot].params[pIndex][1].value = value
			return cars
		})
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
	{#if toolMode === null}
		<div class="col-span-4 flex flex-col justify-center gap-3 px-2">
			Color
			<ColorSlider
				colors={COLORS.POP}
				color={decal.fill}
				onInput={(e) => setDecalColor(COLORS.POP[+e.currentTarget.value])}
			/>
		</div>
		<div class="col-span-4 flex flex-col justify-center px-2">
			Mix <!-- (gradient to neighbor color) -->
			<input type="range" min={-2} max={2} step="1" value={0} class="range" />
			<!-- Direction (rotate +/- 180) (or just a flip checkbox, other angles might clash)
			<input type="range" min={-180} max={180} step="1" value={0} class="range" /> -->
		</div>
		<div class="col-span-2 flex flex-col justify-center px-2">
			Size
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
		<div class="col-span-2 flex flex-col justify-center px-2">
			Spin
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
		{#each decal.params as [paramName, param], p}
			<div class="col-span-2 flex flex-col justify-center px-2">
				{paramName}
				{#if param.type === 'scalar'}
					<input
						type="range"
						min={0}
						max={1}
						step="0.01"
						value={param.value}
						on:input={(e) => setDecalParam(p, +e.currentTarget.value)}
						class="range"
					/>
				{:else if param.type === 'toggle'}
					<input
						checked={param.value}
						type="checkbox"
						on:change={(e) => setDecalParam(p, e.currentTarget.checked)}
						class="checkbox"
					/>
				{/if}
			</div>
		{/each}
		<button
			on:click={() => setToolMode('shape')}
			class="btn btn-md touch-manipulation font-black 2xs:text-lg md:text-xl"
			class:btn-active={toolMode === 'shape'}
		>
			Shape
		</button>
		<button
			on:click={() => removeDecal()}
			class="btn btn-md touch-manipulation text-2xl hover:btn-error md:text-3xl"
			>🗑️</button
		>

		<button
			on:click={() => orderDecal(-1)}
			disabled={slot === 0}
			class="btn btn-md touch-manipulation font-black 2xs:text-lg md:text-xl"
		>
			Push
		</button>
		<button
			on:click={() => orderDecal(1)}
			disabled={slot === $designCar.decals.length - 1}
			class="btn btn-md touch-manipulation font-black 2xs:text-lg md:text-xl"
		>
			Pull
		</button>
	{:else if toolMode === 'shape'}
		<ShapePicker fill={$designCar.decals[slot].fill} onClick={setDecalShape} />
	{/if}
</div>
