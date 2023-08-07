<script lang="ts">
	import { DECAL_NAMES, Decal, type DecalName } from 'grace-train-lib'
	import { DECAL_COLORS, DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { wrapNumber } from '$lib/util'
	import { updateDecalTransform } from './decals'
	import { getDecalStores } from './stores'
	import { getDesignStores } from '../../stores'

	export let slot: number

	const { localCar, displayCar } = getDesignStores()
	const { selectedSlot } = getDecalStores()

	$: decal = $displayCar.decals[slot]

	let toolMode: null | 'shape' | 'color' | 'scale' | 'rotate' | 'order' = null

	const setToolMode = (mode: typeof toolMode) =>
		(toolMode = toolMode === mode ? null : mode)

	function removeDecal() {
		localCar.update((car) => {
			car.decals = car.decals.filter((_, i) => i !== slot)
			car.decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			selectedSlot.set(null)
			return car
		})
	}

	function orderDecal(upOrDown: number) {
		const decal = $displayCar.decals[slot]
		localCar.update((car) => {
			car.decals = car.decals.filter((_, i) => i !== slot)
			car.decals.splice(slot + upOrDown, 0, decal)
			car.decals.forEach((d, i) => (d.slot = i)) // Re-number slots
			selectedSlot.set(decal.slot)
			return car
		})
	}

	function setDecalShape(name: DecalName) {
		localCar.update((car) => {
			car.decals[slot].name = name
			return car
		})
		toolMode = null
	}

	function setDecalColor(color: string) {
		localCar.update((car) => {
			car.decals[slot].fill = color
			return car
		})
		toolMode = null
	}

	function previewDecalColor(color?: string) {
		localCar.update((car) => {
			if (color) {
				car.decals[slot].fillPreview = color
			} else {
				delete car.decals[slot].fillPreview
			}
			return car
		})
	}
</script>

<div class="nunito my-2 grid grid-cols-4 gap-2">
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
		<div class="col-span-4 grid grid-cols-6 gap-2">
			<!-- TODO: Export decal name array from grace-train-lib -->
			{#each DECAL_NAMES as name}
				<button
					on:click={() => setDecalShape(name)}
					class="btn-lg btn touch-manipulation px-0 btn-hover-grow"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="-50 -50 100 100"
						class="w-8 xs:w-10"
					>
						<Decal {name} fill={$displayCar.decals[slot].fill} />
					</svg>
				</button>
			{/each}
		</div>
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
					updateDecalTransform(localCar, slot, decal.transform)
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
					updateDecalTransform(localCar, slot, decal.transform)
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
