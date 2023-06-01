<script lang="ts" context="module">
	const colors = ['#2ae3ff', '#f2ef0d', '#ff538f']
</script>

<script lang="ts">
	import { userCar, type DecalData } from '$lib/store'
	import type { Transform } from '$lib/util'
	import { DECAL_MAX_SCALE, DECAL_MIN_SCALE, updateDecalTransform } from './decals'

	export let index: number
	export let userDecals: DecalData[]
	export let dragTransforms: (Pick<DecalData, 'name' | 'id'> & Transform)[]
	export let setSelectedIndex: (i: number | null) => void

	$: selectedDecal = userDecals[index]

	let toolMode: null | 'scale' | 'rotate' | 'order' | 'colors' = null

	const scaleDecal = (amount: number) => {
		dragTransforms[index].scale = Math.max(
			DECAL_MIN_SCALE,
			Math.min(DECAL_MAX_SCALE, dragTransforms[index].scale + amount * 0.5)
		)
		updateTransform()
	}

	const rotateDecal = (amount: number) => {
		dragTransforms[index].rotate += amount * 15
		updateTransform()
	}

	const updateTransform = () => updateDecalTransform(index, dragTransforms[index])

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
	{#if toolMode === null}
		<button
			on:click={() => (toolMode = 'scale')}
			class="btn-lg btn touch-manipulation text-3xl font-black">-/+</button
		>
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
			on:click={() => (toolMode = 'rotate')}
			class="btn-lg btn touch-manipulation text-4xl font-black">&circlearrowright;</button
		>
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
			on:click={() => (toolMode = 'order')}
			class="btn-lg btn touch-manipulation text-3xl font-black"
			>&ShortDownArrow;&ShortUpArrow;</button
		>
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
		<button on:click={() => (toolMode = 'colors')} class="btn-lg btn touch-manipulation">
			<svg viewBox="0 0 32 32" class="h-8 w-8">
				<rect width="32" height="32" fill={selectedDecal.fill} rx="8" />
			</svg>
		</button>
		<button
			on:click={() => deleteDecal()}
			class="btn-lg btn touch-manipulation text-3xl font-black hover:btn-error">🗑️</button
		>
	{:else if toolMode === 'scale'}
		<button
			on:click={() => (toolMode = null)}
			class="btn-lg btn touch-manipulation text-3xl font-black">&ShortLeftArrow;</button
		>
		<div class="col-span-4 flex h-16 flex-col justify-center px-2">
			<input
				type="range"
				min={DECAL_MIN_SCALE}
				max={DECAL_MAX_SCALE}
				step="0.05"
				value={dragTransforms[index].scale}
				on:input={(e) => {
					dragTransforms[index].scale = +e.currentTarget.value
					updateTransform()
				}}
				class="range range-primary"
			/>
		</div>
	{:else if toolMode === 'rotate'}
		<button
			on:click={() => (toolMode = null)}
			class="btn-lg btn touch-manipulation text-3xl font-black">&ShortLeftArrow;</button
		>
		<div class="col-span-4 flex h-16 flex-col justify-center px-2">
			<input
				type="range"
				min={-180}
				max={180}
				step="1"
				value={-(dragTransforms[index].rotate + (180 % 360) - 180)}
				on:input={(e) => {
					dragTransforms[index].rotate = -e.currentTarget.value
					updateTransform()
				}}
				class="range range-secondary"
			/>
		</div>
	{:else if toolMode === 'colors'}
		{#each colors as color}
			<button on:click={() => setDecalColor(color)} class="btn-lg btn touch-manipulation">
				<svg viewBox="0 0 32 32" class="h-8 w-8">
					<rect width="32" height="32" fill={color} rx="8" />
				</svg>
			</button>
		{/each}
	{/if}
</div>
