<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import UserCar from '$lib/components/UserCar.svelte'
	import { Decal } from 'grace-train-lib'
	import { userCar } from '$lib/store'
	import type { Transform } from '$lib/util'

	const slots = [{}, {}, {}, {}, {}, {}]
	let selectedDecalIndex: number | null = null
	let dragTransform: Transform | null = null

	$: userDecals = $userCar.decals
	$: selectedDecal = userDecals && selectDecal(selectedDecalIndex)

	function selectDecal(index: number | null) {
		if (index === null || index >= userDecals.length) {
			dragTransform = null
			return null
		}
		const decal = userDecals[index]
		dragTransform = {
			...decal.transform,
			translate: { ...decal.transform.translate },
		}
		return decal
	}

	let dragging = false

	function onDrag({ offsetX, offsetY }: DragEventData) {
		dragTransform!.translate = { x: offsetX, y: offsetY }
		updateDecalTransform(dragTransform!)
	}
	const onDragStart = () => (dragging = true)
	const onDragEnd = () => (dragging = false)

	function updateDecalTransform(transform: Transform) {
		if (!selectedDecal) return
		userCar.update((uc) => {
			uc.decals[selectedDecalIndex!].transform = {
				...transform,
				translate: { ...transform.translate },
			}
			return uc
		})
	}

	const scaleDecal = (amount: number) => {
		if (!dragTransform) return
		dragTransform.scale = Math.max(0.5, dragTransform.scale + amount * 0.5)
		updateDecalTransform(dragTransform)
	}

	const rotateDecal = (amount: number) => {
		if (!dragTransform) return
		dragTransform.rotate += amount * 15
		updateDecalTransform(dragTransform)
	}
</script>

<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Decals</h1>
	<div class="relative mx-auto h-[400px] w-[400px] overflow-hidden">
		<div class="absolute left-[-50px] top-[-50px] h-[500px] w-[500px]">
			<div class="absolute left-[62.5px] top-[100px] w-[375px]">
				<UserCar transition={!dragging} />
			</div>
			{#if selectedDecal && dragTransform}
				<div
					use:draggable={{
						bounds: 'parent',
						position: dragTransform.translate,
						onDrag,
						onDragStart,
						onDragEnd,
					}}
					class="absolute left-[12.5px] top-[50px] cursor-move opacity-20"
				>
					<svg
						class="overflow-visible transition-transform"
						viewBox="-50 -50 100 100"
						width="100"
						style:transform-origin="50px 50px"
						style:transform="rotate({dragTransform.rotate}deg) scale({dragTransform.scale})"
					>
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
						<Decal name={selectedDecal.name} />
					</svg>
				</div>
			{/if}
		</div>
	</div>
	{#if dragTransform}
		<div class="nunito my-4 flex justify-center space-x-2">
			<button
				on:click={() => scaleDecal(-1)}
				class="btn-lg btn w-20 touch-manipulation text-4xl font-black">-</button
			>
			<button
				on:click={() => scaleDecal(1)}
				class="btn-lg btn w-20 touch-manipulation text-4xl font-black">+</button
			>
			<button
				on:click={() => rotateDecal(-1)}
				class="btn-lg btn w-20 touch-manipulation text-3xl">&circlearrowleft;</button
			>
			<button
				on:click={() => rotateDecal(1)}
				class="btn-lg btn w-20 touch-manipulation text-3xl">&circlearrowright;</button
			>
		</div>
	{/if}
	<div class="nunito mb-8 grid grid-flow-row grid-cols-2 gap-3">
		{#each slots as slot, s (s)}
			{@const name = userDecals[s]?.name}
			<button
				class="btn-block btn-lg btn gap-4 text-4xl font-black"
				disabled={s === selectedDecalIndex}
				on:click={() => (selectedDecalIndex = s)}
			>
				{#if name}
					<svg viewBox="-50 -50 100 100" class="w-12">
						<Decal {name} />
					</svg>
				{:else}
					+
				{/if}
			</button>
		{/each}
	</div>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
