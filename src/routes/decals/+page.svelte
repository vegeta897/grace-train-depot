<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import UserCar from '$lib/components/UserCar.svelte'
	import { Decal } from 'grace-train-lib'
	import { userCar } from '$lib/store'
	import type { Transform } from '$lib/util'

	let selectedDecalIndex: number | null = null

	$: userDecals = $userCar.decals
	$: dragTransforms = userDecals.map((d) => ({
		name: d.name,
		...d.transform,
		translate: { ...d.transform.translate },
	}))

	function addDecal() {
		selectedDecalIndex = userDecals.length
		userCar.update((uc) => {
			uc.decals = [
				...uc.decals,
				{
					name: 'star',
					transform: { translate: { x: 375 / 2, y: 120 }, scale: 1, rotate: 0 },
				},
			]
			return uc
		})
	}

	let dragging = false

	function onDrag({ offsetX, offsetY }: DragEventData, index: number) {
		dragTransforms[index].translate = { x: offsetX, y: offsetY }
		updateDecalTransform(index, dragTransforms[index])
	}
	const onDragStart = (index: number) => {
		dragging = true
		selectedDecalIndex = index
	}
	const onDragEnd = () => (dragging = false)

	function updateDecalTransform(index: number, transform: Transform) {
		userCar.update((uc) => {
			uc.decals[index].transform = {
				...transform,
				translate: { ...transform.translate },
			}
			return uc
		})
	}

	const scaleDecal = (index: number, amount: number) => {
		dragTransforms[index].scale = Math.max(
			0.5,
			dragTransforms[index].scale + amount * 0.5
		)
		updateDecalTransform(index, dragTransforms[index])
	}

	const rotateDecal = (index: number, amount: number) => {
		dragTransforms[index].rotate += amount * 15
		updateDecalTransform(index, dragTransforms[index])
	}
</script>

<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Decals</h1>
	<div class="relative mx-auto h-[400px] w-[400px] overflow-hidden">
		<div class="absolute left-[-50px] top-[-50px] h-[500px] w-[500px]">
			<div class="absolute left-[62.5px] top-[100px] w-[375px]">
				<UserCar transition={!dragging} />
			</div>
			{#each dragTransforms as transform, d (d)}
				<div
					class="absolute left-[12.5px] top-[50px] h-[100px] w-[100px]"
					use:draggable={{
						bounds: 'parent',
						position: transform.translate,
						onDrag: (dragEvent) => onDrag(dragEvent, d),
						onDragStart: () => onDragStart(d),
						onDragEnd,
					}}
				>
					<button
						class="h-full w-full cursor-move opacity-20 transition-transform"
						style:transform-origin="50px 50px"
						style:transform="rotate({transform.rotate}deg) scale({transform.scale})"
					>
						{#if selectedDecalIndex === d}
							<svg class="w-full overflow-visible" viewBox="-50 -50 100 100">
								<rect
									x="-52"
									y="-52"
									rx="12"
									width="104"
									height="104"
									fill="none"
									stroke="#fff"
									stroke-width="4"
									stroke-dasharray="16 10"
									stroke-linecap="round"
								/>
								<Decal name={transform.name} />
							</svg>
						{/if}
					</button>
				</div>
			{/each}
		</div>
	</div>
	{#if selectedDecalIndex !== null}
		{@const index = selectedDecalIndex}
		<div class="nunito my-4 flex justify-center space-x-2">
			<button
				on:click={() => scaleDecal(index, -1)}
				class="btn-lg btn w-20 touch-manipulation text-4xl font-black">-</button
			>
			<button
				on:click={() => scaleDecal(index, 1)}
				class="btn-lg btn w-20 touch-manipulation text-4xl font-black">+</button
			>
			<button
				on:click={() => rotateDecal(index, -1)}
				class="btn-lg btn w-20 touch-manipulation text-3xl">&circlearrowleft;</button
			>
			<button
				on:click={() => rotateDecal(index, 1)}
				class="btn-lg btn w-20 touch-manipulation text-3xl">&circlearrowright;</button
			>
		</div>
	{/if}
	<div class="nunito mb-8 grid grid-flow-row grid-cols-2 gap-4">
		{#each userDecals as decal, d (d)}
			<button
				class="btn-block btn-lg btn h-24 gap-4 text-5xl font-black"
				class:outline={d === selectedDecalIndex}
				class:outline-4={d === selectedDecalIndex}
				class:outline-primary={d === selectedDecalIndex}
				on:click={() => (selectedDecalIndex = d === selectedDecalIndex ? null : d)}
			>
				<svg viewBox="-50 -50 100 100" class="w-14">
					<Decal name={decal.name} />
				</svg>
			</button>
		{/each}
		{#if userDecals.length < 6}
			<button
				class="btn-block btn-lg btn h-24 gap-4 text-5xl font-black"
				on:click={addDecal}
			>
				+
			</button>
		{/if}
	</div>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
