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

	const corners = [
		[-1, -1],
		[1, -1],
		[-1, 1],
		[1, 1],
	]
	const cornerCursors = ['nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize'] as const
	const getCornerCursor = (index: number, angle: number) =>
		cornerCursors[(index + Math.round(((angle % 360) + 360) / 45)) % 4]
	const getCornerScale = (corner: number) => (resizing!.corner === corner ? 1.5 : 0.5)
	let resizing: {
		corner: number
		index: number
		transform: Transform
		calcScale: (x: number, y: number) => number
	} | null = null
	let rotating: {
		index: number
		transform: Transform
		calcRotate: (x: number, y: number) => number
	} | null = null
	function startResize(corner: number) {
		if (selectedDecalIndex === null) return
		const transform = dragTransforms[selectedDecalIndex]
		const canvasBox = canvasElement.getBoundingClientRect()
		const originX = canvasBox.x + (transform.translate.x + 62.5) * canvasScale
		const originY = canvasBox.y + (transform.translate.y + 100) * canvasScale
		const radians = transform.rotate * (Math.PI / 180)
		const cos = Math.cos(radians)
		const sin = Math.sin(radians)
		resizing = {
			corner,
			index: selectedDecalIndex,
			transform,
			calcScale: (x: number, y: number) => {
				const nx = cos * (x - originX) + sin * (y - originY) + originX
				const ny = cos * (y - originY) - sin * (x - originX) + originY
				const xDistance = ((nx - originX) * corners[corner][0]) / canvasScale
				const yDistance = ((ny - originY) * corners[corner][1]) / canvasScale
				const avgDistance = (xDistance + yDistance) / 2
				return Math.max(0.5, Math.min(4, (avgDistance - 14) / 50))
			},
		}
	}
	function startRotate() {
		if (selectedDecalIndex === null) return
		const transform = dragTransforms[selectedDecalIndex]
		const canvasBox = canvasElement.getBoundingClientRect()
		const originX = canvasBox.x + (transform.translate.x + 62.5) * canvasScale
		const originY = canvasBox.y + (transform.translate.y + 100) * canvasScale
		rotating = {
			index: selectedDecalIndex,
			transform,
			calcRotate: (x: number, y: number) => {
				return Math.atan2(y - originY, x - originX) * (180 / Math.PI) - 90
			},
		}
	}
	function onPointerMove(e: PointerEvent) {
		if (resizing) {
			resizing.transform.scale = resizing.calcScale(e.clientX, e.clientY)
			updateDecalTransform(resizing.index, resizing.transform)
		} else if (rotating) {
			rotating.transform.rotate = rotating.calcRotate(e.clientX, e.clientY)
			updateDecalTransform(rotating.index, rotating.transform)
		}
	}
	let resizeRotateCooldown = false
	function onPointerUp() {
		if (!resizing && !rotating) return
		resizing = null
		rotating = null
		resizeRotateCooldown = true
		setTimeout(() => (resizeRotateCooldown = false), 100)
	}

	const testDot = { x: -9, y: -9 } // Position a red dot on the page
</script>

<svelte:window
	on:resize={updateCanvasScale}
	on:pointermove={onPointerMove}
	on:pointerup={onPointerUp}
/>
<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Decals</h1>
	<h2 class="text-center text-4xl">look at adobe express!</h2>
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
				<UserCar transition={!dragging && !resizing && !rotating} />
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
						class="h-full w-full cursor-move rounded-xl"
						class:transition-transform={!resizing && !rotating}
						style:transform-origin="50px 50px"
						style:transform="rotate({transform.rotate}deg) scale({transform.scale})"
						use:clickoutside={{
							limit: { parent: canvasElement },
							enabled: !resizeRotateCooldown,
						}}
						on:mouseenter={() => !dragging && (hoveredDecalIndex = d)}
						on:mouseleave={() => (hoveredDecalIndex = null)}
						on:focus={() => (hoveredDecalIndex = d)}
						on:blur={() => (hoveredDecalIndex = null)}
						on:clickoutside={() => (selectedDecalIndex = null)}
						on:click|stopPropagation
						out:fade={{ duration: 150 }}
					>
						<svg
							class="pointer-events-none w-full overflow-visible"
							viewBox="-50 -50 100 100"
							class:transition-opacity={selectedDecalIndex !== d &&
								hoveredDecalIndex !== d}
							class:opacity-0={selectedDecalIndex !== d && hoveredDecalIndex !== d}
							class:opacity-40={hoveredDecalIndex === d && selectedDecalIndex !== d}
							class:opacity-80={selectedDecalIndex === d}
						>
							<rect
								class:transition-all={!resizing}
								x={-50 - 13 / transform.scale}
								y={-50 - 13 / transform.scale}
								width={100 + 26 / transform.scale}
								height={100 + 26 / transform.scale}
								fill="none"
								stroke="#fff"
								stroke-width={5 / transform.scale}
								stroke-dashoffset={(100 + 26 / transform.scale) * 0.075}
								stroke-dasharray="{(100 + 26 / transform.scale) * 0.15} {(100 +
									26 / transform.scale) *
									0.1}"
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
				{#if selectedDecalIndex === d}
					<div
						class="pointer-events-none absolute left-[12.5px] top-[50px] h-[100px] w-[100px] transition-transform"
						class:transition-transform={!dragging && !resizing && !rotating}
						style:transform="translate({transform.translate.x}px,{transform.translate
							.y}px) rotate({transform.rotate}deg)"
					>
						{#each corners as [xDir, yDir], c}
							<button
								on:pointerdown={() => startResize(c)}
								style:transform="translate({((transform.scale - 1) * 50 + 64) *
									xDir}px,{((transform.scale - 1) * 50 + 64) * yDir}px) scale({(resizing &&
									getCornerScale(c)) ||
									1})"
								class="pointer-events-auto absolute left-[34px] top-[34px] h-8 w-8 origin-center touch-none rounded-2xl bg-primary"
								class:transition-transform={!resizing}
								class:transition-opacity={!resizing}
								class:opacity-60={resizing}
								style:cursor={getCornerCursor(Math.abs(xDir + yDir), transform.rotate)}
							/>
							<button
								on:pointerdown={() => startRotate()}
								style:transform="translate(0,{(transform.scale - 1) * 50 + 90}px) scale({rotating
									? 1.5
									: 1})"
								class="pointer-events-auto absolute left-[34px] top-[34px] h-8 w-8 origin-center touch-none rounded-2xl bg-secondary"
								class:transition-transform={!resizing && !rotating}
								class:transition-opacity={!resizing}
								class:opacity-60={resizing}
							/>
						{/each}
					</div>
				{/if}
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
	<!-- Maybe don't need drag n drop or hover layers, or drag n drop and delete mode -->
	<!-- Prefer using buttons under canvas for deleting and re-ordering -->
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
						on:pointerdown={startSortDrag}
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
	<div
		class="absolute left-0 top-0 h-[3px] w-[3px] rounded-sm bg-red-600"
		style:transform="translate({testDot.x - 1.5}px,{testDot.y - 1.5}px)"
	/>
</section>
