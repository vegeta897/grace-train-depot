<script lang="ts">
	import type { DecalName } from 'grace-train-lib'
	import { DECAL_COLORS, DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { updateDecalTransform } from './decals'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../../stores'
	import ShapePicker from './ShapePicker.svelte'

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

	const colors: string[] = [...DECAL_COLORS]
	const colorMargin = 1 / (colors.length * 3)
	const colorsGradient = `linear-gradient(to right, ${colors
		.map((c, i) => {
			const p = i / (colors.length - 1)
			const start = Math.max(0, p - colorMargin)
			const end = Math.min(1, p + colorMargin)
			return `${c} ${Math.round(start * 100)}% ${Math.round(end * 100)}%`
		})
		.join(', ')})`

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

<div class="nunito grid grid-cols-4 gap-2">
	<button
		on:click={() => setToolMode('scale')}
		class="btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		class:text-primary={toolMode !== 'scale'}
		class:btn-primary={toolMode === 'scale'}
	>
		Size
	</button>
	<button
		on:click={() => setToolMode('rotate')}
		class="btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		class:text-secondary={toolMode !== 'rotate'}
		class:btn-secondary={toolMode === 'rotate'}
	>
		Spin
	</button>
	<button
		on:click={() => setToolMode('shape')}
		class="btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		class:btn-active={toolMode === 'shape'}
	>
		Shape
	</button>
	{#if toolMode !== 'color'}
		<button
			on:click={() => setToolMode('color')}
			class="btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
			style:color={$designCar.decals[slot].fill}
		>
			Color
		</button>
	{:else}
		<button
			on:click={() => setToolMode('color')}
			class="btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
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
			class="btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		>
			Push
		</button>
		<button
			on:click={() => orderDecal(1)}
			disabled={slot === $designCar.decals.length - 1}
			class="btn btn-md touch-manipulation 2xs:text-lg md:text-xl"
		>
			Pull
		</button>
	{:else if toolMode === 'shape'}
		<ShapePicker fill={$designCar.decals[slot].fill} onClick={setDecalShape} />
	{:else if toolMode === 'color'}
		<!-- <div class="col-span-4 grid grid-cols-6 gap-2">
			{#each DECAL_COLORS as color}
				<button
					on:click={() => setDecalColor(color)}
					on:mouseenter={() => previewDecalColor(color)}
					on:mouseleave={() => previewDecalColor()}
					class="btn-hover-grow btn btn-lg touch-manipulation px-0"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="h-8 w-8">
						<rect width="32" height="32" fill={color} rx="8" />
					</svg>
				</button>
			{/each}
		</div> -->
		<div class="col-span-4 flex h-16 flex-col justify-center gap-2 px-2">
			<input
				type="range"
				min={0}
				max={colors.length - 1}
				step="1"
				value={colors.indexOf(decal.fill)}
				on:input={(e) => {
					setDecalColor(colors[+e.currentTarget.value])
				}}
				class="range"
			/>
			<div class="relative flex overflow-clip rounded-full">
				<div class="mx-[0.75rem] h-3 grow" style:background={colorsGradient} />
				<div class="absolute left-0 h-3 w-4" style:background-color={colors[0]} />
				<div
					class="absolute right-0 h-3 w-4"
					style:background-color={colors[colors.length - 1]}
				/>
			</div>
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
