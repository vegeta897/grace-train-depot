<script lang="ts">
	import { ContainerSvg, Decal, decalDefs } from 'grace-train-lib/components'
	import {
		DECAL_MAX_SCALE,
		DECAL_MAX_SLOTS,
		DECAL_MIN_SCALE,
	} from '$lib/common/constants'
	import { removeDecal, updateDecalTransform } from './decals'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../stores'
	import ShapePicker, { type DecalChoice } from './ShapePicker.svelte'
	import ColorSlider from '../ColorSlider.svelte'
	import { COLORS } from 'grace-train-lib'
	import type { DecalData } from '$lib/server/schemas'
	import { capitalize } from '$lib/util'
	import { cloneDecal } from '$lib/car'

	const SCALE_RANGE = DECAL_MAX_SCALE - DECAL_MIN_SCALE

	export let slot: number

	const { localCars, designCar, designShortId } = getDesignStores()
	const { selectedSlot, dirtyCanvas } = getDecalStores()

	$: decal = $designCar.decals[slot]
	$: paramConfig = decalDefs[decal.name].paramConfig

	let toolMode: null | 'shape' = null

	const setToolMode = (mode: typeof toolMode) =>
		(toolMode = toolMode === mode ? null : mode)

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

	function setDecalShape({ name, fill, params }: DecalChoice) {
		localCars.update((cars) => {
			if (name !== cars[$designShortId].decals[slot].name) {
				cars[$designShortId].decals[slot].name = name
				if (fill) cars[$designShortId].decals[slot].fill = fill as DecalData['fill']
				cars[$designShortId].decals[slot].params =
					params || decalDefs[name].getDefaultParamsObject()
			}
			return cars
		})
		toolMode = null
	}

	function setDecalColor(color: DecalData['fill']) {
		localCars.update((cars) => {
			cars[$designShortId].decals[slot].fill = color
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

<div class="rounded-box grid grid-flow-row-dense grid-cols-4 gap-2 bg-neutral p-2 xs:p-4">
	{#if toolMode === null}
		{#if !decalDefs[decal.name].noFill}
			<!-- TODO: Make these controls into components -->
			<div
				class="col-span-4 my-1 flex items-center xs:col-span-2 xs:my-0 xs:flex-col xs:items-start"
			>
				<label for="color" class="w-16">Color</label>
				<div class="w-full grow">
					<ColorSlider
						colors={COLORS.POP}
						color={decal.fill}
						onInput={(e) => setDecalColor(COLORS.POP[+e.currentTarget.value])}
					/>
				</div>
			</div>
			<div class="col-span-4 my-1 flex xs:col-span-2 xs:my-0 xs:flex-col">
				<!-- (gradient to neighbor color) -->
				<label for="color" class="w-16">Mix</label>
				<input id="mix" type="range" min={-2} max={2} step="1" value={0} class="range" />
				<!-- Direction (rotate +/- 180) (or just a flip checkbox, other angles might clash)
			<input type="range" min={-180} max={180} step="1" value={0} class="range" /> -->
			</div>
		{/if}
		<div class="col-span-4 my-1 flex xs:col-span-2 xs:my-0 xs:flex-col">
			<label for="size" class="w-16">Size</label>
			<input
				id="size"
				type="range"
				min={0}
				max={100}
				step="1"
				value={Math.round(
					((decal.scale - DECAL_MIN_SCALE) / SCALE_RANGE) ** (1 / 1.5) * 100
				)}
				on:input={(e) => {
					const inputValue = (+e.currentTarget.value / 100) ** 1.5
					decal.scale = DECAL_MIN_SCALE + SCALE_RANGE * inputValue
					updateDecalTransform(localCars, $designShortId, slot, decal)
				}}
				on:change={() => dirtyCanvas.set(true)}
				class="range range-primary"
			/>
		</div>
		<div class="col-span-4 my-1 flex xs:col-span-2 xs:my-0 xs:flex-col">
			<label for="size" class="w-16">Spin</label>
			<input
				id="spin"
				type="range"
				min={-180}
				max={180}
				step="2"
				list="rotations"
				value={decal.rotate}
				on:input={(e) => {
					decal.rotate = +e.currentTarget.value
					updateDecalTransform(localCars, $designShortId, slot, decal)
				}}
				class="range range-secondary"
			/>
			<datalist id="rotations">
				<option>-90</option>
				<option>0</option>
				<option>90</option>
			</datalist>
		</div>
		{#each paramConfig as param}
			<div
				class="col-span-4 my-1 flex xs:col-span-2 xs:my-0 xs:flex-col"
				class:xs:col-span-4={param.type === 'stringList'}
			>
				<label for={param.name} class="w-16">{capitalize(param.name)}</label>
				{#if param.type === 'scalar'}
					<input
						id={param.name}
						type="range"
						min={0}
						max={1}
						step="0.01"
						value={decal.params[param.name]}
						on:input={(e) => setDecalParam(param.name, +e.currentTarget.value)}
						class="range"
					/>
				{:else if param.type === 'toggle'}
					<input
						checked={decal.params[param.name]}
						type="checkbox"
						on:change={(e) => setDecalParam(param.name, e.currentTarget.checked)}
						class="checkbox"
					/>
				{:else if (param.type = 'stringList')}
					<div
						class="grid grid-cols-[repeat(auto-fill,_minmax(3.5rem,_1fr))] gap-1 rounded-lg bg-base-100 p-1"
					>
						{#each param.list as listItem}
							<button
								class="btn btn-ghost btn-sm h-auto w-full px-2"
								on:click={() => setDecalParam(param.name, listItem)}
							>
								<ContainerSvg viewBox="-50 -50 100 100" class="overflow-visible">
									<Decal
										name={decal.name}
										fill={decal.fill}
										params={{ ...decal.params, [param.name]: listItem }}
									/>
								</ContainerSvg>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
		<!-- <div class="col-span-4"> -->
		<!-- <button
			on:click={() => deleteDecal()}
			class="btn btn-md touch-manipulation text-2xl hover:btn-error md:text-3xl"
			>🗑️</button
		> -->
		<button
			on:click={() => orderDecal(1)}
			disabled={slot === $designCar.decals.length - 1}
			class="btn btn-md col-span-2 col-start-1 touch-manipulation font-black 2xs:text-lg md:text-xl"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 10 10"
				class="w-6 -scale-y-100 fill-none stroke-current"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5,2 v7 l-2.5,-2.5 m2.5,2.5 l2.5,-2.5"
				/>
			</svg>
			<span class="w-16">Pull</span>
		</button>
		<button
			on:click={() => orderDecal(-1)}
			disabled={slot === 0}
			class="btn btn-md col-span-2 col-start-1 touch-manipulation font-black 2xs:text-lg md:text-xl"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 10 10"
				class="w-6 fill-none stroke-current"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5,2 v7 l-2.5,-2.5 m2.5,2.5 l2.5,-2.5"
				/>
			</svg>
			<span class="w-16">Push</span>
		</button>
		<button
			on:click={() => setToolMode('shape')}
			class="btn btn-md col-span-2 touch-manipulation font-black 2xs:text-lg md:text-xl"
		>
			Shape
		</button>
		<button
			on:click={() => duplicateDecal()}
			class="btn btn-md col-span-2 touch-manipulation font-black 2xs:text-lg md:text-xl"
			disabled={$designCar.decals.length >= DECAL_MAX_SLOTS}
		>
			Copy
		</button>
		<!-- </div> -->
	{:else if toolMode === 'shape'}
		<div class="col-span-4">
			<ShapePicker
				fillOverride={decalDefs[decal.name].noFill
					? undefined
					: $designCar.decals[slot].fill}
				onClick={setDecalShape}
			/>
		</div>
		<button
			class="btn-nd btn col-span-2 font-black 2xs:text-lg md:text-xl lg:col-span-1"
			on:click={() => setToolMode(null)}>Back</button
		>
	{/if}
</div>
