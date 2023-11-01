<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import { wrapNumber } from '$lib/util'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { fade } from 'svelte/transition'
	import { Decal } from 'grace-train-lib/components'
	import BoundingBox from './BoundingBox.svelte'
	import { DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { getDecalStores } from './stores'
	import DesignCar from '$lib/components/DesignCar.svelte'
	import type { Transform } from '$lib/types'
	import type { CarDataWithIds } from '$lib/server/schemas'
	import { DECAL_RADIUS, removeDecal, updateDecalTransform } from './decals'
	import { getDesignStores } from '../stores'
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'

	export let car: CarDataWithIds
	export let setTestDot: (x: number, y: number) => void = () => {}

	const { localCars, designShortId, designCar } = getDesignStores()
	const { hoveredSlot, selectedSlot, dragging, dirtyCanvas } = getDecalStores()

	$: draggables = $designCar.decals.map((d) => ({
		id: d.id,
		x: d.x,
		y: d.y,
		scale: d.scale,
		rotate: d.rotate,
	}))

	let canvasTop: number
	let canvasBottom: number
	let canvasLeft: number
	let canvasRight: number

	dirtyCanvas.subscribe((dirty) => {
		if (!dirty) return
		dirtyCanvas.set(false)
		canvasTop = -10
		canvasBottom = 310
		canvasLeft = -10
		canvasRight = 425
		const transform = $selectedSlot !== null && draggables[$selectedSlot]
		if (!transform) return
		canvasTop = Math.min(canvasTop, transform.y - DECAL_RADIUS * transform.scale - 25)
		canvasBottom = Math.max(
			canvasBottom,
			transform.y + DECAL_RADIUS * transform.scale + 25
		)
		canvasLeft = Math.min(canvasLeft, transform.x - DECAL_RADIUS * transform.scale - 5)
		canvasRight = Math.max(canvasRight, transform.x + DECAL_RADIUS * transform.scale + 45)
		// TODO: Apply canvas-scale-adjusted padding to handle larger resize/rotate handles
	})

	let containerElement: HTMLDivElement
	let canvasElement: HTMLDivElement
	let containerWidth: number
	let containerHeight: number

	$: canvasHeight = canvasBottom - canvasTop
	$: canvasWidth = canvasRight - canvasLeft
	$: canvasScale = Math.min(containerHeight / canvasHeight, containerWidth / canvasWidth)
	$: panY =
		Math.max(0, containerHeight - canvasHeight * canvasScale) / 2 -
		canvasTop * canvasScale
	$: panX =
		Math.max(0, containerWidth - canvasWidth * canvasScale) / 2 - canvasLeft * canvasScale

	onMount(() => {
		dirtyCanvas.set(true)
		setTimeout(() => canvasElement.classList.add('transition-transform'))
	})

	$: transforming = !!($dragging || resizing || rotating)

	const onDragStart = (slot: number) => {
		const transform = { ...draggables[slot] }
		dragging.set({ slot, transform })
		selectedSlot.set(slot)
		dirtyCanvas.set(true)
	}

	function onDrag({ offsetX, offsetY }: DragEventData, slot: number) {
		if (!$dragging) return
		const transform = draggables[slot]
		transform.x = $dragging.transform.x + (offsetX - $dragging.transform.x) / canvasScale
		transform.y = $dragging.transform.y + (offsetY - $dragging.transform.y) / canvasScale
		updateDecalTransform(localCars, $designShortId, slot, transform)
	}

	let clickOutsideCooldown = false

	const onDragEnd = () => {
		dirtyCanvas.set(true)
		dragging.set(null)
		clickOutsideCooldown = true
		setTimeout(() => (clickOutsideCooldown = false), 100)
	}

	const corners = [
		[-1, -1],
		[1, -1],
		[-1, 1],
		[1, 1],
	]
	const cornerCursors = ['nesw-resize', 'ew-resize', 'nwse-resize', 'ns-resize'] as const
	const getCornerCursor = (corner: number, angle: number) =>
		cornerCursors[(corner + Math.round(((angle % 360) + 360) / 45)) % 4]
	const getCornerScale = (corner: number) => (resizing!.corner === corner ? 1.5 : 0.5)
	let resizing: {
		corner: number
		slot: number
		transform: Transform
		calcScale: (x: number, y: number) => number
	} | null = null
	let rotating: {
		slot: number
		transform: Transform
		snap: boolean
		calcRotate: (x: number, y: number) => number
	} | null = null

	function startResize(corner: number) {
		if ($selectedSlot === null) return
		const transform = draggables[$selectedSlot]
		const canvasBox = canvasElement.getBoundingClientRect()
		const originX = canvasBox.x + (20 + transform.x) * canvasScale
		const originY = canvasBox.y + transform.y * canvasScale
		setTestDot(originX, originY)
		const radians = transform.rotate * (Math.PI / 180)
		const cos = Math.cos(radians)
		const sin = Math.sin(radians)
		resizing = {
			corner,
			slot: $selectedSlot,
			transform,
			calcScale: (x: number, y: number) => {
				const nx = cos * (x - originX) + sin * (y - originY) + originX
				const ny = cos * (y - originY) - sin * (x - originX) + originY
				const xDistance = ((nx - originX) * corners[corner][0]) / canvasScale
				const yDistance = ((ny - originY) * corners[corner][1]) / canvasScale
				const avgDistance = (xDistance + yDistance) / 2
				return Math.max(
					DECAL_MIN_SCALE,
					Math.min(DECAL_MAX_SCALE, (avgDistance - 5) / 50)
				)
			},
		}
	}

	const snapRotation = (a: number) => {
		const snapped = Math.round(a / 45) * 45
		return Math.abs(a - snapped) < 5 && snapped
	}

	function startRotate() {
		if ($selectedSlot === null) return
		const transform = draggables[$selectedSlot]
		const canvasBox = canvasElement.getBoundingClientRect()
		const originX = canvasBox.x + (20 + transform.x) * canvasScale
		const originY = canvasBox.y + transform.y * canvasScale
		setTestDot(originX, originY)
		rotating = {
			slot: $selectedSlot,
			transform,
			snap: snapRotation(transform.rotate) === false ? false : true,
			calcRotate: (x: number, y: number) => {
				let angle = Math.atan2(y - originY, x - originX) * (180 / Math.PI) - 90
				angle = wrapNumber(angle, -180, 180)
				const snapped = snapRotation(angle)
				rotating!.snap = false
				if (snapped !== false) {
					angle = snapped
					rotating!.snap = true
				}
				return Math.round(angle * 10) / 10
			},
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (resizing) resizing.transform.scale = resizing.calcScale(e.clientX, e.clientY)
		if (rotating) rotating.transform.rotate = rotating.calcRotate(e.clientX, e.clientY)
		const operation = resizing || rotating
		if (!operation) return
		updateDecalTransform(localCars, $designShortId, operation.slot, operation.transform)
	}

	async function onPointerUp() {
		if (!resizing && !rotating) return
		resizing = null
		rotating = null
		dirtyCanvas.set(true)
		clickOutsideCooldown = true
		setTimeout(() => (clickOutsideCooldown = false), 100)
	}
	const outline = false // Debug outlines
</script>

<svelte:window on:pointermove={onPointerMove} on:pointerup={onPointerUp} />
<!-- <div class="absolute space-x-1">
	<span>{Math.round(containerHeight)}</span>
	<span>{Math.round(canvasHeight)}</span>
	<span>{Math.round(canvasTop)}</span>
	<span>{Math.round(canvasBottom)}</span>
	<span>{Math.round(panY)}</span>
</div> -->
<div
	class="relative overflow-clip outline-green-700"
	bind:this={containerElement}
	class:outline-dotted={outline}
>
	<div
		class="relative mx-auto max-h-[40vh] max-w-[600px] outline-yellow-600"
		class:outline-dotted={outline}
		style:aspect-ratio="4 / 3"
		bind:clientWidth={containerWidth}
		bind:clientHeight={containerHeight}
	>
		<div
			class="absolute left-0 top-0 w-[415px] outline-red-400"
			class:outline-dotted={outline}
			class:hidden={!browser}
			style:transform-origin="left top"
			style:transform="translate({panX}px, {panY}px) scale({canvasScale})"
			bind:this={canvasElement}
		>
			<DesignCar
				{car}
				focusTopperSlot={$selectedSlot === null ? null : -1}
				transition={['fill', 'stroke', 'opacity']}
				focusDecalZone={$selectedSlot !== null}
				animateDecalAppear
				cropToCar
			/>
			{#each draggables as transform, d (transform.id)}
				{@const decal = $designCar.decals[d]}
				<div
					class="absolute left-[20px] top-0 h-0 w-0 select-none"
					class:z-10={$selectedSlot === d}
					use:draggable={{
						position: transform,
						onDrag: (dragEvent) => onDrag(dragEvent, d),
						onDragStart: () => onDragStart(d),
						onDragEnd,
					}}
				>
					<button
						class="relative left-[-50px] top-[-50px] h-[100px] w-[100px] cursor-move rounded-xl"
						style:transform-origin="50px 50px"
						style:transform="rotate({transform.rotate}deg) scale({transform.scale})"
						use:clickoutside={{
							limit: { parent: containerElement },
							enabled: !clickOutsideCooldown,
						}}
						on:mouseenter={() =>
							!$dragging && !resizing && !rotating && hoveredSlot.set(d)}
						on:mouseleave={() => hoveredSlot.set(null)}
						on:focus={() => hoveredSlot.set(d)}
						on:blur={() => hoveredSlot.set(null)}
						on:clickoutside={() => {
							selectedSlot.set(null)
							dirtyCanvas.set(true)
						}}
						on:click|stopPropagation
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-full overflow-visible"
							viewBox="-50 -50 100 100"
							class:opacity-0={$selectedSlot !== d && $hoveredSlot !== d}
							class:opacity-50={$selectedSlot !== d && $hoveredSlot === d}
						>
							<BoundingBox
								scale={transform.scale}
								selected={$selectedSlot === d}
								strokeWidthScale={1 / canvasScale}
								{transforming}
							/>
							<g class:opacity-25={$selectedSlot === d}>
								<Decal
									name={decal.name}
									fill={decal.fillPreview || decal.fill}
									params={decal.params}
									transition={['fill', 'stroke']}
								/>
							</g>
						</svg>
					</button>
				</div>
			{/each}
			{#if $selectedSlot !== null}
				{@const transform = draggables[$selectedSlot]}
				{#key $selectedSlot}
					<div
						class="pointer-events-none absolute left-[-30px] top-[-50px] z-10 h-0 w-0"
						style:transform-origin="50px 50px"
						style:transform="translate({transform.x}px,{transform.y}px) rotate({transform.rotate}deg)"
						transition:fade={{ duration: 50 }}
					>
						{#each corners as [xDir, yDir], c}
							<div
								style:transform="translate({((transform.scale - 1) * 50 + 55) *
									xDir}px,{((transform.scale - 1) * 50 + 55) * yDir}px)"
							>
								<button
									on:pointerdown={() => startResize(c)}
									style:transform="scale({((resizing && getCornerScale(c)) ||
										(rotating || $dragging ? 0.5 : 1)) / canvasScale})"
									class="pointer-events-auto absolute left-[34px] top-[34px] h-8 w-8 origin-center touch-none rounded-2xl border-5 border-white bg-primary"
									class:transition-transform={!resizing}
									class:transition-opacity={!resizing}
									class:opacity-30={transforming}
									class:!opacity-60={resizing?.corner === c}
									style:cursor={getCornerCursor(Math.abs(xDir + yDir), transform.rotate)}
								/>
							</div>
						{/each}
						<div
							class="transition-transform"
							style:transform="translate(0, {(transform.scale - 1) * 50 + 90}px)"
						>
							<button
								on:pointerdown={() => startRotate()}
								style:transform="scale({(rotating ? 1.5 : 1) / canvasScale})"
								class="pointer-events-auto absolute left-[34px] top-[34px] h-8 w-8 origin-center touch-none rounded-2xl border-5 border-white bg-secondary"
								class:transition-all={!resizing}
								class:opacity-60={rotating}
								class:opacity-0={resizing || $dragging}
							/>
						</div>
					</div>
				{/key}
			{/if}
		</div>
	</div>
	<!-- <button
		on:click|preventDefault={(e) => (macroView = !macroView)}
		style:-webkit-backdrop-filter="blur(4px)"
		style:backdrop-filter="blur(4px)"
		style:--tw-bg-opacity="0.8"
		class="btn btn-circle absolute right-2 top-2 h-12 w-12 2xs:h-14 2xs:w-14 lg:right-4 lg:top-4 lg:h-16 lg:w-16"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-1/2 w-1/2 stroke-current"
		>
			<path
				class="origin-center transition-transform"
				style:transform="scale({macroView ? -1 : 1})"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="6"
				vector-effect="non-scaling-stroke"
				d="M21,3 L3,21 M21,3 h-10 M21,3 v10"
			/>
		</svg>
	</button> -->
	{#if $selectedSlot !== null}
		{@const slot = $selectedSlot}
		<button
			on:click|preventDefault={() => {
				removeDecal(localCars, $designShortId, slot)
				selectedSlot.set(null)
				dirtyCanvas.set(true)
			}}
			style:-webkit-backdrop-filter="blur(4px)"
			style:backdrop-filter="blur(4px)"
			style:--tw-bg-opacity="0.8"
			class="btn btn-circle absolute bottom-2 right-2 h-12 w-12 text-2xl hover:btn-error 2xs:h-14 2xs:w-14 lg:bottom-4 lg:right-4 lg:h-16 lg:w-16 lg:p-4 lg:text-3xl"
		>
			🗑️
		</button>
	{/if}
</div>
