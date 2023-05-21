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
	import { onMount } from 'svelte'

	let selectedDecalIndex: number | null = null
	let hoveredDecalIndex: number | null = null
	let canvasElement: HTMLDivElement
	let userTrainContainer: HTMLDivElement

	let canvasScale: number
	onMount(updateCanvasScale)
	function updateCanvasScale() {
		canvasScale = userTrainContainer.clientWidth / 464
	}

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
		if (userDecals.length - 1 === 0) decalButtonMode = 'none'
		userCar.update((uc) => ({
			...uc,
			decals: uc.decals.filter((_, i) => i !== index),
		}))
	}

	const flipDurationMs = 150
	let sortDragDisabled = true
	const decalButtonModes = ['sort', 'delete'] as const
	let decalButtonMode: 'none' | (typeof decalButtonModes)[number] = 'none'
	const decalButtonModeIcons = {
		sort: '&updownarrow;',
		delete: 'X',
	}

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

<svelte:window on:resize={updateCanvasScale} />
<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Decals</h1>
	<div
		class="relative mx-auto h-[350px] w-full overflow-hidden"
		bind:this={userTrainContainer}
	>
		<div
			class="absolute top-[-50px] h-[400px] w-[500px] origin-center"
			style:left="calc((100% - 500px) / 2)"
			style:transform="scale({canvasScale})"
			bind:this={canvasElement}
		>
			<div class="relative top-[100px] mx-auto w-[375px]">
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
	<div class="nunito my-4 flex h-16 justify-end space-x-2">
		{#if selectedDecalIndex === null}
			{#each decalButtonModes as mode}
				<button
					on:click={() => (decalButtonMode = decalButtonMode === mode ? 'none' : mode)}
					class="btn-lg btn w-20 touch-manipulation text-4xl font-black"
					class:btn-primary={decalButtonMode === mode}
					disabled={(mode === 'sort' && userDecals.length < 2) || userDecals.length === 0}
					>{@html decalButtonModeIcons[mode]}</button
				>
			{/each}
		{:else}
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
			dropTargetClasses: ['!outline-none'],
		}}
		on:consider={handleSortConsider}
		on:finalize={handleSortFinalize}
		class="nunito mb-8 flex flex-col-reverse gap-4 rounded-lg"
	>
		{#each userDecals as decal, d (decal.id)}
			<li
				animate:flip={{ duration: flipDurationMs }}
				class:outline={d === selectedDecalIndex}
				class:outline-4={d === selectedDecalIndex}
				class:outline-primary={d === selectedDecalIndex}
				class="btn-group w-full rounded-lg"
			>
				{#if decalButtonMode === 'none'}
					<button
						class="btn-lg btn h-24 grow"
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
				{:else}
					<div class="no-animation btn-lg btn pointer-events-none h-24 grow">
						<svg viewBox="-50 -50 100 100" class="w-14">
							<Decal name={decal.name} />
						</svg>
					</div>
				{/if}
				{#if decalButtonMode === 'sort'}
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<div
						class="btn-outline btn-primary btn-lg btn pointer-events-auto h-24 w-24 select-all border-4 text-3xl font-black"
						tabindex={sortDragDisabled ? 0 : -1}
						aria-label="drag-handle"
						on:mousedown={startSortDrag}
						on:touchstart={startSortDrag}
						on:keydown={handleSortKeyDown}
						on:mouseenter={() => (hoveredDecalIndex = d)}
						on:mouseleave={() => (hoveredDecalIndex = null)}
						on:focus={() => (hoveredDecalIndex = d)}
						on:blur={() => (hoveredDecalIndex = null)}
					>
						&updownarrow;
					</div>
				{:else if decalButtonMode === 'delete'}
					<button
						class="btn-outline btn-error btn-lg btn h-24 w-24 border-4 text-3xl font-black"
						on:click={() => deleteDecal(d)}
						on:mouseenter={() => (hoveredDecalIndex = d)}
						on:mouseleave={() => (hoveredDecalIndex = null)}
						on:focus={() => (hoveredDecalIndex = d)}
						on:blur={() => (hoveredDecalIndex = null)}>X</button
					>
				{/if}
			</li>
		{/each}
	</ol>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
