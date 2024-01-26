<script lang="ts">
	import { decalDefs } from 'grace-train-lib/components'
	import {
		DECAL_MAX_SCALE,
		DECAL_MAX_SLOTS,
		DECAL_MIN_SCALE,
	} from '$lib/common/constants'
	import { removeDecal, updateDecalTransform } from './decals'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../stores'
	// import ShapePicker, { type DecalChoice } from './ShapePicker.svelte'
	import ColorSlider from '../ColorSlider.svelte'
	import { COLORS } from 'grace-train-lib'
	import { cloneDecal } from '$lib/car'
	import StripesControls from './StripesControls.svelte'
	import ParamControls from '../ParamControls.svelte'
	import type { DecalData } from 'grace-train-lib/data'
	import Icon from '$lib/components/Icon.svelte'

	export let slot: number

	const { localCars, designCar, designShortId } = getDesignStores()
	const { selectedSlot, dirtyCanvas } = getDecalStores()

	$: decal = $designCar.decals[slot]
	$: decalDef = decalDefs[decal.name]
	$: minScale = decalDef.minScale || DECAL_MIN_SCALE
	$: maxScale = decalDef.maxScale || DECAL_MAX_SCALE
	$: scaleRange = maxScale - minScale

	function deleteDecal() {
		removeDecal(localCars, $designShortId, slot)
		selectedSlot.set(null)
	}

	function duplicateDecal() {
		const decal = $designCar.decals[slot]
		const decalCopy = cloneDecal(decal)
		decalCopy.slot = $designCar.decals.length
		decalCopy.id = Date.now()
		localCars.update((cars) => {
			cars[$designShortId].decals.push(decalCopy)
			selectedSlot.set(decalCopy.slot)
			return cars
		})
	}

	// function setDecalShape({ name, fill, params }: DecalChoice) {
	// 	localCars.update((cars) => {
	// 		if (name !== cars[$designShortId].decals[slot].name) {
	// 			cars[$designShortId].decals[slot].name = name
	// 			if (fill) cars[$designShortId].decals[slot].fill = fill as DecalData['fill']
	// 			cars[$designShortId].decals[slot].params = {
	// 				...decalDefs[name].getDefaultParamsObject(),
	// 				...params,
	// 			}
	// 		}
	// 		return cars
	// 	})
	// }

	function setDecalColor(color: string) {
		localCars.update((cars) => {
			cars[$designShortId].decals[slot].fill = color as DecalData['fill']
			return cars
		})
		// toolMode = null
	}

	function setDecalParam(name: string, value: number | boolean | string) {
		localCars.update((cars) => {
			cars[$designShortId].decals[slot].params[name] = value
			return cars
		})
	}
</script>

{#key decal.id}
	<div class="rounded-box flex flex-col gap-4 bg-neutral p-2 xs:p-4">
		<div class="flex items-center justify-between">
			<h3 class="text-xl font-bold sm:text-2xl" style:color={decal.fill}>
				{decal.name}
			</h3>
			<button
				class="btn btn-circle btn-sm xs:h-10 xs:w-10"
				on:click={() => selectedSlot.set(null)}
				><Icon class="w-3 xs:w-4" icon="x" /></button
			>
		</div>
		{#if decal.name === 'stripes'}
			<div class="col-span-4 rounded-xl bg-base-100 p-2 xs:p-4">
				<StripesControls {decal} />
			</div>
		{/if}
		<div class="grid grid-cols-[min-content_auto] items-center gap-x-3 gap-y-4">
			{#if !decalDef.noFill}
				<!-- TODO: Make these controls into components -->
				<label for="fill" class="text-lg lg:text-xl">color</label>
				<ColorSlider
					id="fill"
					colors={COLORS.POP}
					color={decal.fill}
					onInput={setDecalColor}
				/>
				<!-- (gradient to neighbor color) -->
				<!-- <label for="mix" class="text-lg lg:text-xl">mix</label>
					<input
						id="mix"
						type="range"
						min={-Math.min(COLORS.POP.indexOf(decal.fill), 6)}
						max={Math.min(COLORS.POP.length - COLORS.POP.indexOf(decal.fill) - 1, 6)}
						step="1"
						value={0}
						class="range"
					/> -->
				<!-- Direction (rotate +/- 180) (or just a flip checkbox, other angles might clash)
			<input type="range" min={-180} max={180} step="1" value={0} class="range" /> -->
			{/if}
			<label for="size" class="text-lg lg:text-xl">size</label>
			<input
				id="size"
				type="range"
				min={0}
				max={100}
				step="1"
				list="sizes"
				value={Math.round(((decal.scale - minScale) / scaleRange) ** (1 / 1.5) * 100)}
				on:input={(e) => {
					const inputValue = (e.currentTarget.valueAsNumber / 100) ** 1.5
					decal.scale = minScale + scaleRange * inputValue
					// This is kinda meh but whatever
					if (Math.abs(1 - decal.scale) < 0.01) decal.scale = 1
					else if (Math.abs(2 - decal.scale) < 0.01) decal.scale = 2
					else if (Math.abs(3 - decal.scale) < 0.01) decal.scale = 3
					updateDecalTransform(localCars, $designShortId, slot, decal)
				}}
				on:change={() => dirtyCanvas.set(true)}
				class="range range-primary"
			/>
			<datalist id="sizes">
				<option>{Math.round(((1 - minScale) / scaleRange) ** (1 / 1.5) * 100)}</option>
			</datalist>
			<label for="size" class="text-lg lg:text-xl">spin</label>
			<input
				id="spin"
				type="range"
				min={-180}
				max={180}
				step="2"
				list="rotations"
				value={decal.rotate}
				on:input={(e) => {
					decal.rotate = e.currentTarget.valueAsNumber
					updateDecalTransform(localCars, $designShortId, slot, decal)
				}}
				class="range range-secondary"
			/>
			<datalist id="rotations">
				<option>-90</option>
				<option>0</option>
				<option>90</option>
			</datalist>
			<ParamControls
				object={{ type: 'decal', data: decal, def: decalDef }}
				onInput={setDecalParam}
				onChange={() => dirtyCanvas.set(true)}
			/>
		</div>
		<!-- <div class="col-span-4"> -->
		<!-- <button
			on:click={() => deleteDecal()}
			class="btn btn-md touch-manipulation text-2xl hover:btn-error md:text-3xl"
			>🗑️</button
		> -->
		<div class="col-span-4 grid grid-cols-2 gap-2">
			<!-- <button
					on:click={() => setToolMode('shape')}
					class="btn btn-md 2xs:text-lg md:text-xl"
				>
					Swap
				</button> -->
			<button
				on:click={() => duplicateDecal()}
				class="btn btn-md 2xs:text-lg md:text-xl"
				disabled={$designCar.decals.length >= DECAL_MAX_SLOTS}
			>
				Copy
			</button>
			<button
				on:click={() => deleteDecal()}
				class="btn btn-md 2xs:text-lg md:text-xl"
				disabled={$designCar.decals.length >= DECAL_MAX_SLOTS}
			>
				Delete
			</button>
		</div>
		<!-- </div> -->
		<!-- {:else if toolMode === 'shape'}
			<div class="col-span-4">
				<ShapePicker
					fillOverride={decalDef.noFill ? undefined : $designCar.decals[slot].fill}
					onPick={setDecalShape}
				/>
			</div>
			<button
				class="btn-nd btn col-span-2 font-black 2xs:text-lg md:text-xl lg:col-span-1"
				on:click={() => setToolMode(null)}>Back</button
			> -->
	</div>
{/key}
