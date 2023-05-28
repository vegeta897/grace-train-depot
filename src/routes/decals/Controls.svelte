<script lang="ts" context="module">
	const colors = ['#2ae3ff', '#f2ef0d', '#ff538f']
</script>

<script lang="ts">
	import { userCar, type DecalData } from '$lib/store'
	import type { Transform } from '$lib/util'
	import { updateDecalTransform } from './decals'

	export let index: number
	export let userDecals: DecalData[]
	export let dragTransforms: (Pick<DecalData, 'name' | 'id'> & Transform)[]
	export let setSelectedIndex: (i: number | null) => void

	$: selectedDecal = userDecals[index]

	let toolMode: null | 'colors' = null

	const scaleDecal = (amount: number) => {
		dragTransforms[index].scale = Math.max(
			0.5,
			dragTransforms[index].scale + amount * 0.5
		)
		updateDecalTransform(index, dragTransforms[index])
	}

	const rotateDecal = (amount: number) => {
		dragTransforms[index].rotate += amount * 15
		updateDecalTransform(index, dragTransforms[index])
	}

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
		<div class="btn-group col-span-2">
			<button
				on:click={() => scaleDecal(-1)}
				class="btn-lg btn w-1/2 touch-manipulation text-4xl font-black">-</button
			>
			<button
				on:click={() => scaleDecal(1)}
				class="btn-lg btn w-1/2 touch-manipulation text-4xl font-black">+</button
			>
		</div>
		<div class="btn-group col-span-2">
			<button
				on:click={() => rotateDecal(-1)}
				class="btn-lg btn w-1/2 touch-manipulation text-3xl">&circlearrowleft;</button
			>
			<button
				on:click={() => rotateDecal(1)}
				class="btn-lg btn w-1/2 touch-manipulation text-3xl">&circlearrowright;</button
			>
		</div>
		<div class="btn-group col-span-2">
			<button
				on:click={() => orderDecal(-1)}
				disabled={index === 0}
				class="btn-lg btn w-1/2 touch-manipulation text-3xl">&ShortDownArrow;</button
			>
			<button
				on:click={() => orderDecal(1)}
				disabled={index === dragTransforms.length - 1}
				class="btn-lg btn w-1/2 touch-manipulation text-3xl">&ShortUpArrow;</button
			>
		</div>
		<button on:click={() => (toolMode = 'colors')} class="btn-lg btn touch-manipulation">
			<svg viewBox="0 0 1 1" class="h-8 w-8">
				<rect width="1" height="1" fill={selectedDecal.fill} rx="0.2" />
			</svg>
		</button>
		<button
			on:click={() => deleteDecal()}
			class="btn-lg btn touch-manipulation text-2xl font-black hover:btn-error">x</button
		>
	{:else if toolMode === 'colors'}
		{#each colors as color}
			<button on:click={() => setDecalColor(color)} class="btn-lg btn touch-manipulation">
				<svg viewBox="0 0 1 1" class="h-8 w-8">
					<rect width="1" height="1" fill={color} rx="0.2" />
				</svg>
			</button>
		{/each}
	{/if}
</div>
