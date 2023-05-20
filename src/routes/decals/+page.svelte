<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import UserCar from '$lib/components/UserCar.svelte'
	import { Decal } from 'grace-train-lib'
	import { userCar, type DecalData } from '$lib/store'
	import type { Transform } from '$lib/util'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { fade } from 'svelte/transition'
	import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action'
	import { flip } from 'svelte/animate'

	let selectedDecalIndex: number | null = null
	let hoveredDecalIndex: number | null = null
	let canvasElement: HTMLDivElement

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
					id: Date.now(),
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

	function deleteDecal(index: number) {
		if (selectedDecalIndex !== null) {
			if (selectedDecalIndex > index) selectedDecalIndex -= 1
			else if (selectedDecalIndex === index) selectedDecalIndex = null
		}
		userCar.update((uc) => ({
			...uc,
			decals: uc.decals.filter((_, i) => i !== index),
		}))
	}

	const flipDurationMs = 150
	let sortDragDisabled = true

	function handleSortConsider(e: CustomEvent<DndEvent<DecalData>>) {
		const {
			items,
			info: { source, trigger },
		} = e.detail
		userCar.update((uc) => ({ ...uc, decals: items }))
		if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED) {
			sortDragDisabled = true
		}
	}

	function handleSortFinalize(e: CustomEvent<DndEvent<DecalData>>) {
		const {
			items,
			info: { source },
		} = e.detail
		userCar.update((uc) => ({ ...uc, decals: items }))
		if (source === SOURCES.POINTER) sortDragDisabled = true
	}

	function startSortDrag(e: Event) {
		e.preventDefault()
		sortDragDisabled = false
	}

	function handleSortKeyDown(e: KeyboardEvent) {
		if ((e.key === 'Enter' || e.key === ' ') && sortDragDisabled) {
			sortDragDisabled = false
		}
	}
</script>

<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Decals</h1>
	<div class="relative mx-auto h-[350px] w-[400px] overflow-hidden">
		<div
			class="absolute left-[-50px] top-[-50px] h-[400px] w-[500px]"
			bind:this={canvasElement}
		>
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
						class="h-full w-full cursor-move rounded-xl opacity-50 transition-transform"
						style:transform-origin="50px 50px"
						style:transform="rotate({transform.rotate}deg) scale({transform.scale})"
						use:clickoutside={{ limit: { parent: canvasElement } }}
						on:mouseenter={() => !dragging && (hoveredDecalIndex = d)}
						on:mouseleave={() => (hoveredDecalIndex = null)}
						on:focus={() => (hoveredDecalIndex = d)}
						on:blur={() => (hoveredDecalIndex = null)}
						on:clickoutside={() => (selectedDecalIndex = null)}
						on:click|stopPropagation
						out:fade={{ duration: 150 }}
					>
						<svg
							class="w-full overflow-visible"
							viewBox="-50 -50 100 100"
							class:transition-opacity={selectedDecalIndex !== d &&
								hoveredDecalIndex !== d}
							class:opacity-0={selectedDecalIndex !== d && hoveredDecalIndex !== d}
							class:opacity-40={hoveredDecalIndex === d && selectedDecalIndex !== d}
							class:opacity-80={selectedDecalIndex === d}
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
							<g
								class:transition-opacity={selectedDecalIndex !== d &&
									hoveredDecalIndex !== d}
								class:opacity-50={selectedDecalIndex === d}
							>
								<Decal name={transform.name} />
							</g>
						</svg>
					</button>
				</div>
			{/each}
		</div>
	</div>
	<div class="nunito my-4 flex h-16 justify-center space-x-2">
		{#if selectedDecalIndex !== null}
			{@const index = selectedDecalIndex}
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
		{/if}
	</div>

	{#if userDecals.length < 6}
		<button
			class="nunito btn-block btn-lg btn mb-4 h-20 text-5xl font-black"
			on:click={addDecal}
		>
			+
		</button>
	{/if}
	<ol
		use:dndzone={{
			items: userDecals,
			flipDurationMs,
			dragDisabled: sortDragDisabled,
			dropTargetClasses: [],
		}}
		on:consider={handleSortConsider}
		on:finalize={handleSortFinalize}
		class="nunito mb-8 flex flex-col gap-4 rounded-lg"
	>
		{#each userDecals as decal, d (decal.id)}
			<li
				animate:flip={{ duration: flipDurationMs }}
				class:outline={d === selectedDecalIndex}
				class:outline-4={d === selectedDecalIndex}
				class:outline-primary={d === selectedDecalIndex}
				class="btn-group w-full rounded-lg"
			>
				<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
				<div
					tabindex={sortDragDisabled ? 0 : -1}
					aria-label="drag-handle"
					on:mousedown={startSortDrag}
					on:touchstart={startSortDrag}
					on:keydown={handleSortKeyDown}
					class="btn-lg btn pointer-events-auto h-24 select-all text-3xl font-black"
				>
					&updownarrow;
				</div>
				<button
					class="btn-lg btn h-24 grow gap-4 text-5xl font-black"
					on:click={() => (selectedDecalIndex = d === selectedDecalIndex ? null : d)}
					on:mouseenter={() => (hoveredDecalIndex = d)}
					on:mouseleave={() => (hoveredDecalIndex = null)}
					on:focus={() => (hoveredDecalIndex = d)}
					on:blur={() => (hoveredDecalIndex = null)}
				>
					<svg viewBox="-50 -50 100 100" class="w-14">
						<Decal name={decal.name} />
					</svg>
				</button>
				<button
					on:click={() => deleteDecal(d)}
					class="btn-lg btn h-24 text-3xl font-black hover:btn-error"
					on:mouseenter={() => (hoveredDecalIndex = d)}
					on:mouseleave={() => (hoveredDecalIndex = null)}
					on:focus={() => (hoveredDecalIndex = d)}
					on:blur={() => (hoveredDecalIndex = null)}>X</button
				>
			</li>
		{/each}
	</ol>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
