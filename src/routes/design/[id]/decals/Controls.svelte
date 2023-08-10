<script lang="ts">
	import type { DecalName } from 'grace-train-lib'
	import { DECAL_COLORS, DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { wrapNumber } from '$lib/util'
	import { updateDecalTransform } from './decals'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../../stores'
	import ShapePicker from './ShapePicker.svelte'

	export let slot: number

	const { localCars, displayCar, designShortId } = getDesignStores()
	const { selectedSlot } = getDecalStores()

	$: decal = $displayCar.decals[slot]

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
		const decal = $displayCar.decals[slot]
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
		toolMode = null
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

<div class="nunito grid grid-cols-4 gap-2">
	<button
		on:click={() => setToolMode('scale')}
		class="btn-md btn touch-manipulation 2xs:text-lg md:text-xl"
		class:text-primary={toolMode !== 'scale'}
		class:btn-primary={toolMode === 'scale'}
	>
		Size
	</button>
	<button
		on:click={() => setToolMode('rotate')}
		class="btn-md btn touch-manipulation 2xs:text-lg md:text-xl"
		class:text-secondary={toolMode !== 'rotate'}
		class:btn-secondary={toolMode === 'rotate'}
	>
		Spin
	</button>
	<button
		on:click={() => setToolMode('shape')}
		class="btn-md btn touch-manipulation 2xs:text-lg md:text-xl"
		class:btn-active={toolMode === 'shape'}
	>
		Shape
	</button>
	{#if toolMode !== 'color'}
		<button
			on:click={() => setToolMode('color')}
			class="btn-md btn touch-manipulation 2xs:text-lg md:text-xl"
			style:color={$displayCar.decals[slot].fill}
		>
			Color
		</button>
	{:else}
		<button
			on:click={() => setToolMode('color')}
			class="btn-md btn touch-manipulation 2xs:text-lg md:text-xl"
			style:background={$displayCar.decals[slot].fill}
			style:color="hsl(var(--inc))"
		>
			Color
		</button>
	{/if}
	<!-- <button
		on:click={() => setToolMode('order')}
		class="btn-md btn touch-manipulation text-lg md:text-xl"
		class:btn-info={toolMode === 'order'}
	>
		Order
	</button> -->
	{#if toolMode === null}
		<button
			on:click={() => removeDecal()}
			class="btn-md btn touch-manipulation text-2xl md:text-3xl hover:btn-error"
			>🗑️</button
		>

		<button
			on:click={() => orderDecal(-1)}
			disabled={slot === 0}
			class="btn-md btn touch-manipulation 2xs:text-lg md:text-xl"
		>
			Push
		</button>
		<button
			on:click={() => orderDecal(1)}
			disabled={slot === $displayCar.decals.length - 1}
			class="btn-md btn touch-manipulation 2xs:text-lg md:text-xl"
		>
			Pull
		</button>
	{:else if toolMode === 'shape'}
		<ShapePicker fill={$displayCar.decals[slot].fill} onClick={setDecalShape} />
	{:else if toolMode === 'color'}
		<div class="col-span-4 grid grid-cols-6 gap-2">
			{#each DECAL_COLORS as color}
				<button
					on:click={() => setDecalColor(color)}
					on:mouseenter={() => previewDecalColor(color)}
					on:mouseleave={() => previewDecalColor()}
					class="btn-lg btn touch-manipulation px-0 btn-hover-grow"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="h-8 w-8">
						<rect width="32" height="32" fill={color} rx="8" />
					</svg>
				</button>
			{/each}
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
				value={wrapNumber(-decal.transform.rotate, -180, 180)}
				on:input={(e) => {
					decal.transform.rotate = wrapNumber(-e.currentTarget.value, 0, 360)
					updateDecalTransform(localCars, $designShortId, slot, decal.transform)
				}}
				class="range range-secondary"
			/>
		</div>
	{:else if toolMode === 'order'}
		<!-- <div class="col-span-4 grid grid-cols-4 gap-2">
			<button
				disabled={slot === 0}
				on:click={() => orderDecal(0)}
				class="btn-md btn text-lg md:text-xl"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" class="h-7 w-7">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
						stroke="#fff"
						d="M5,2 v6 m-2,-2 l2,2 l2,-2 m1,3 h-6"
					/>
				</svg>
			</button>
			<button
				disabled={slot === 0}
				on:click={() => orderDecal(slot - 1)}
				class="btn-md btn text-lg md:text-xl"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" class="h-7 w-7">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
						stroke="#fff"
						d="M5,2 v6 m-2,-2 l2,2 l2,-2"
					/>
				</svg>
			</button>
			<button
				disabled={slot === DECAL_MAX_SLOTS - 1}
				on:click={() => orderDecal(slot + 1)}
				class="btn-md btn text-lg md:text-xl"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" class="h-7 w-7">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
						stroke="#fff"
						d="M5,8 v-6 m2,2 l-2,-2 l-2,2"
					/>
				</svg>
			</button>
			<button
				disabled={slot === DECAL_MAX_SLOTS - 1}
				on:click={() => orderDecal(DECAL_MAX_SLOTS - 1)}
				class="btn-md btn text-lg md:text-xl"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" class="h-7 w-7">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
						stroke="#fff"
						d="M5,8 v-6 m2,2 l-2,-2 l-2,2 m-1,-3 h6"
					/>
				</svg>
			</button>
		</div> -->
	{/if}
</div>
