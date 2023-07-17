<script lang="ts" context="module">
	const colors = ['#2ae3ff', '#f2ef0d', '#ff538f']
</script>

<script lang="ts">
	import { wrapNumber, type Transform } from '$lib/util'
	import { DECAL_MAX_SCALE, DECAL_MIN_SCALE, updateDecalTransform } from './decals'

	export let index: number
	export let userDecals: DecalData[]
	export let dragTransforms: (Pick<DecalData, 'name' | 'id'> & Transform)[]
	export let setSelectedIndex: (i: number | null) => void

	$: selectedDecal = userDecals[index]
	$: dragTransform = dragTransforms[index]

	let toolMode: null | 'scale' | 'rotate' | 'order' | 'colors' = null

	const setToolMode = (mode: typeof toolMode) =>
		(toolMode = toolMode === mode ? null : mode)

	const scaleDecal = (amount: number) => {
		dragTransform.scale = Math.max(
			DECAL_MIN_SCALE,
			Math.min(DECAL_MAX_SCALE, dragTransform.scale + amount * 0.5)
		)
		updateTransform()
	}

	const rotateDecal = (amount: number) => {
		dragTransform.rotate += amount * 15
		updateTransform()
	}

	const updateTransform = () => updateDecalTransform(index, dragTransform)

	function deleteDecal() {
		setSelectedIndex(null)
		userCar.update((uc) => ({
			...uc,
			decals: uc.decals.filter((_, i) => i !== index),
		}))
	}

	function orderDecal(direction: number) {
		const newIndex = Math.max(0, Math.min(dragTransforms.length - 1, index + direction))
		if (newIndex === index) return
		userCar.update((uc) => {
			uc.decals.splice(newIndex, 0, uc.decals.splice(index, 1)[0])
			return uc
		})
		setSelectedIndex(newIndex)
	}

	function setDecalColor(color: string) {
		userCar.update((uc) => {
			uc.decals[index].fill = color
			return uc
		})
		toolMode = null
	}
</script>

<div class="nunito my-2 grid grid-cols-4 gap-2">
	<button
		on:click={() => setToolMode('scale')}
		class="btn-md btn touch-manipulation text-lg font-black md:text-xl"
		class:text-primary={toolMode !== 'scale'}
		class:btn-primary={toolMode === 'scale'}
	>
		Size
	</button>
	<!-- <div class="join col-span-2">
			<button
				on:click={() => scaleDecal(-1)}
				class="btn-lg join-item btn w-1/2 touch-manipulation text-4xl font-black">-</button
			>
			<button
				on:click={() => scaleDecal(1)}
				class="btn-lg join-item btn w-1/2 touch-manipulation text-4xl font-black">+</button
			>
		</div> -->
	<button
		on:click={() => setToolMode('rotate')}
		class="btn-md btn touch-manipulation text-lg font-black md:text-xl"
		class:text-secondary={toolMode !== 'rotate'}
		class:btn-secondary={toolMode === 'rotate'}
	>
		Spin
	</button>
	<!-- <div class="join col-span-2">
			<button
				on:click={() => rotateDecal(-1)}
				class="btn-lg join-item btn w-1/2 touch-manipulation text-3xl">&circlearrowleft;</button
			>
			<button
				on:click={() => rotateDecal(1)}
				class="btn-lg join-item btn w-1/2 touch-manipulation text-3xl">&circlearrowright;</button
			>
		</div> -->
	<button
		on:click={() => setToolMode('order')}
		class="btn-md btn touch-manipulation text-lg font-black md:text-xl"
		class:btn-info={toolMode === 'order'}
	>
		Sort
	</button>
	<!-- <div class="join col-span-2">
			<button
				on:click={() => orderDecal(-1)}
				disabled={index === 0}
				class="btn-lg join-item btn w-1/2 touch-manipulation text-3xl">&ShortDownArrow;</button
			>
			<button
				on:click={() => orderDecal(1)}
				disabled={index === dragTransforms.length - 1}
				class="btn-lg join-item btn w-1/2 touch-manipulation text-3xl">&ShortUpArrow;</button
			>
		</div> -->
	<button
		on:click={() => setToolMode('colors')}
		class="btn-md btn touch-manipulation text-lg font-black md:text-xl"
		class:btn-info={toolMode === 'colors'}
	>
		Color
	</button>
	{#if toolMode === null}
		<button
			on:click={() => deleteDecal()}
			class="btn-md btn touch-manipulation text-3xl font-black hover:btn-error">🗑️</button
		>
	{:else if toolMode === 'scale'}
		<div class="col-span-4 flex h-12 flex-col justify-center px-2">
			<input
				type="range"
				min={DECAL_MIN_SCALE}
				max={DECAL_MAX_SCALE}
				step="0.05"
				value={dragTransform.scale}
				on:input={(e) => {
					dragTransform.scale = +e.currentTarget.value
					updateTransform()
				}}
				class="range range-primary"
			/>
		</div>
	{:else if toolMode === 'rotate'}
		<div class="col-span-4 flex h-12 flex-col justify-center px-2">
			<input
				type="range"
				min={-180}
				max={180}
				step="1"
				value={wrapNumber(-dragTransform.rotate, -180, 180)}
				on:input={(e) => {
					dragTransform.rotate = wrapNumber(-e.currentTarget.value, 0, 360)
					updateTransform()
				}}
				class="range range-secondary"
			/>
		</div>
	{:else if toolMode === 'colors'}
		<div class="col-span-4 grid grid-cols-6 gap-2">
			<!-- TODO: Preview decal color on hover -->
			{#each colors as color}
				<button
					on:click={() => setDecalColor(color)}
					class="btn-lg btn touch-manipulation p-0"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="h-8 w-8">
						<rect width="32" height="32" fill={color} rx="8" />
					</svg>
				</button>
			{/each}
		</div>
	{/if}
</div>
