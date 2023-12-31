<script lang="ts">
	import type { DragEventData } from '@neodrag/svelte'
	import { wrapNumber, draggable, degToRad } from '$lib/util'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { fade } from 'svelte/transition'
	import { Decal } from 'grace-train-lib/components'
	import BoundingBox from './BoundingBox.svelte'
	import { DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { getDecalStores } from './stores'
	import DesignCar from '$lib/components/DesignCar.svelte'
	import type { Transform } from '$lib/types'
	import { getDecalBoundingBox, removeDecal, updateDecalTransform } from './decals'
	import { getDesignStores } from '../stores'
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { cubicOut } from 'svelte/easing'

	export let setTestDot: (x: number, y: number) => void = () => {}

	const { localCars, designShortId, designCar } = getDesignStores()
	const { hoveredSlot, selectedSlot, dragging, dirtyCanvas, previewDecal } =
		getDecalStores()

	previewDecal.set(null)

	$: draggables = $designCar.decals.map((d) => {
		return {
			id: d.id,
			x: d.x,
			y: d.y,
			scale: d.scale,
			rotate: d.rotate,
			// snapPoints:
			// 	d.name === 'arc' ? getArcEndpoints({ ...d, ...(d.params as ArcParams) }) : [],
		}
	})

	const canvasTop = -10
	const canvasBottom = 310
	const canvasLeft = -10
	const canvasRight = 385
	const canvasCenterY = (canvasBottom - canvasTop) / 2
	const canvasCenterX = (canvasRight - canvasLeft) / 2
	const UI_PAD = 16

	let decalTop: number
	let decalBottom: number
	let decalLeft: number
	let decalRight: number

	dirtyCanvas.subscribe((dirty) => {
		if (!dirty) return
		dirtyCanvas.set(false)
		decalTop = canvasCenterY
		decalBottom = canvasCenterY
		decalLeft = canvasCenterX
		decalRight = canvasCenterX
		const decal = $selectedSlot !== null && $designCar.decals[$selectedSlot]
		if (!decal) return
		const { width, height } = getDecalBoundingBox(decal)
		const radians = degToRad(decal.rotate)
		const cos = Math.cos(radians)
		const sin = Math.sin(radians)
		const decalHeight = (Math.abs(width * sin) + Math.abs(height * cos)) * decal.scale
		const decalWidth = (Math.abs(width * cos) + Math.abs(height * sin)) * decal.scale
		decalTop = decal.y - decalHeight / 2 - 32
		decalBottom = decal.y + decalHeight / 2 + 32
		decalLeft = decal.x - decalWidth / 2 - 32
		decalRight = decal.x + decalWidth / 2 + 32
	})

	let containerElement: HTMLDivElement
	let canvasElement: HTMLDivElement
	let containerWidth: number
	let containerHeight: number

	// This makes my head hurt but it works well enough
	$: panUp = Math.max(0, Math.min(UI_PAD, Math.max(0, canvasTop + UI_PAD - decalTop)))
	$: panDown = Math.max(
		0,
		Math.min(UI_PAD, Math.max(0, decalBottom - (canvasBottom - UI_PAD)))
	)
	$: panLeft = Math.max(0, Math.min(UI_PAD, Math.max(0, canvasLeft + UI_PAD - decalLeft)))
	$: panRight = Math.max(
		0,
		Math.min(UI_PAD, Math.max(0, decalRight - (canvasRight - UI_PAD)))
	)
	$: canvasHeight = Math.max(canvasBottom, decalBottom) - Math.min(canvasTop, decalTop)
	$: canvasWidth = Math.max(canvasRight, decalRight) - Math.min(canvasLeft, decalLeft)
	$: canvasScale = Math.min(
		(containerHeight - (panUp + panDown)) / canvasHeight,
		(containerWidth - (panLeft + panRight)) / canvasWidth
	)
	$: panY =
		Math.max(0, containerHeight - panUp + panDown - canvasHeight * canvasScale) / 2 -
		Math.min(canvasTop, decalTop) * canvasScale +
		panUp -
		panDown
	$: panX =
		Math.max(0, containerWidth - panLeft + panRight - canvasWidth * canvasScale) / 2 -
		Math.min(canvasLeft, decalLeft) * canvasScale +
		panLeft -
		panRight

	onMount(() => {
		dirtyCanvas.set(true)
		setTimeout(() => canvasElement?.classList.add('transition-transform'))
	})

	let snapping = false
	$: transforming = !!($dragging || resizing || rotating)

	const onDragStart = (slot: number) => {
		const transform = { ...draggables[slot] }
		dragging.set({ slot, transform })
		selectedSlot.set(slot)
		hoveredSlot.set(null)
		dirtyCanvas.set(true)
	}

	function onDrag({ offsetX, offsetY }: DragEventData, slot: number) {
		if (!$dragging) return
		const transform = draggables[slot]
		const dragX = (offsetX - $dragging.transform.x) / canvasScale
		const dragY = (offsetY - $dragging.transform.y) / canvasScale
		let newX = $dragging.transform.x + dragX
		let newY = $dragging.transform.y + dragY
		// if (transform.snapPoints.length > 0) {
		// 	let bestSnapDistance = Infinity
		// 	let snapToX = null
		// 	let snapToY = null
		// 	for (let snapPoint of transform.snapPoints) {
		// 		const draggedSnapX = snapPoint.x + (newX - transform.x)
		// 		const draggedSnapY = snapPoint.y + (newY - transform.y)
		// 		for (let otherDraggable of draggables) {
		// 			if (otherDraggable === transform) continue
		// 			for (let otherSnap of otherDraggable.snapPoints) {
		// 				if (Math.abs(otherSnap.angle - snapPoint.angle) % 360 !== 180) continue
		// 				const snapDeltaX = otherSnap.x - draggedSnapX
		// 				const snapDeltaY = otherSnap.y - draggedSnapY
		// 				const snapDistance = Math.abs(snapDeltaX) + Math.abs(snapDeltaY)
		// 				if (
		// 					Math.abs(snapDeltaX) < 8 &&
		// 					Math.abs(snapDeltaY) < 8 &&
		// 					snapDistance < bestSnapDistance
		// 				) {
		// 					snapToX = $dragging.transform.x + dragX + snapDeltaX
		// 					snapToY = $dragging.transform.y + dragY + snapDeltaY
		// 					bestSnapDistance = snapDistance
		// 				}
		// 			}
		// 		}
		// 	}
		// 	if (snapToX !== null) newX = snapToX
		// 	if (snapToY !== null) newY = snapToY
		// }
		transform.x = newX
		transform.y = newY
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
		const boundingBox = getDecalBoundingBox($designCar.decals[$selectedSlot])
		const canvasBox = canvasElement.getBoundingClientRect()
		const originX = canvasBox.x + transform.x * canvasScale
		const originY = canvasBox.y + transform.y * canvasScale
		setTestDot(originX, originY)
		const radians = degToRad(transform.rotate)
		const cos = Math.cos(radians)
		const sin = Math.sin(radians)
		resizing = {
			corner,
			slot: $selectedSlot,
			transform,
			calcScale: (x: number, y: number) => {
				const nx = cos * (x - originX) + sin * (y - originY) + originX
				const ny = cos * (y - originY) - sin * (x - originX) + originY
				const xDistance = ((nx - originX) * corners[corner][0]) / canvasScale - 5
				const yDistance = ((ny - originY) * corners[corner][1]) / canvasScale - 5
				const avgDistance =
					(xDistance / (boundingBox.width / 2) + yDistance / (boundingBox.height / 2)) / 2
				return Math.max(DECAL_MIN_SCALE, Math.min(DECAL_MAX_SCALE, avgDistance))
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
		const originX = canvasBox.x + transform.x * canvasScale
		const originY = canvasBox.y + transform.y * canvasScale
		setTestDot(originX, originY)
		rotating = {
			slot: $selectedSlot,
			transform,
			snap: snapRotation(transform.rotate) === false ? false : true,
			calcRotate: (x: number, y: number) => {
				let angle = Math.atan2(y - originY, x - originX) * (180 / Math.PI) - 90
				angle = wrapNumber(angle, -180, 180)
				if (snapping) {
					const snapped = snapRotation(angle)
					rotating!.snap = false
					if (snapped !== false) {
						angle = snapped
						rotating!.snap = true
					}
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
<div
	class="relative touch-none outline-green-700"
	bind:this={containerElement}
	class:outline-dotted={outline}
>
	<div
		class="relative mx-auto max-h-[40vh] max-w-[600px] touch-none outline-yellow-600 lg:max-h-full"
		class:outline-dotted={outline}
		style:aspect-ratio="4 / 3"
		bind:clientWidth={containerWidth}
		bind:clientHeight={containerHeight}
	>
		<div
			class="absolute left-0 top-0 w-[375px] touch-none outline-red-400"
			class:outline-dotted={outline}
			class:hidden={!browser}
			style:transform-origin="left top"
			style:transform="translate({panX}px, {panY}px) scale({canvasScale})"
			bind:this={canvasElement}
		>
			{#if browser}
				<DesignCar
					car={$designCar}
					focusTopperSlot={$selectedSlot === null ? null : -1}
					transition={['fill', 'stroke', 'opacity']}
					focusDecalZone={$selectedSlot !== null}
					cropToCar
				/>
			{/if}
			<div class="absolute left-0 top-0 w-full touch-none">
				{#each draggables as transform, d (transform.id)}
					{@const decal = $designCar.decals[d]}
					{@const params =
						decal.id === $previewDecal?.id ? $previewDecal.params : decal.params}
					{@const boundingBox = getDecalBoundingBox(decal)}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 375 300"
						width="100%"
						class="pointer-events-none absolute left-0 top-0 touch-none overflow-visible"
						class:z-10={$selectedSlot === d}
					>
						<g
							class="pointer-events-auto cursor-move select-none outline-none"
							class:opacity-0={$selectedSlot !== d && $hoveredSlot !== d}
							class:opacity-50={$selectedSlot !== d && $hoveredSlot === d}
							use:draggable={{
								position: transform,
								onDrag: (dragEvent) => onDrag(dragEvent, d),
								onDragStart: () => onDragStart(d),
								onDragEnd,
							}}
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
							on:keypress
							role="button"
							tabindex={d + 1}
						>
							<g style:transform="rotate({decal.rotate}deg) scale({decal.scale})">
								<BoundingBox
									width={boundingBox.width}
									height={boundingBox.height}
									scale={transform.scale}
									corners={$selectedSlot !== d || $previewDecal !== null}
									strokeWidthScale={1 / canvasScale}
									faded={$selectedSlot === d && transforming}
									fullHitbox={$selectedSlot === d}
								/>
								<g class="opacity-60">
									<Decal
										name={decal.name}
										fill={decal.fill}
										{params}
										transition={['fill', 'stroke']}
									/>
								</g>
							</g>
						</g>
					</svg>
				{/each}
			</div>
			{#if $selectedSlot !== null}
				{@const transform = draggables[$selectedSlot]}
				{@const decal = $designCar.decals[$selectedSlot]}
				{@const boundingBox = getDecalBoundingBox(decal)}
				{#key decal.id}
					<div
						class="pointer-events-none absolute left-[-50px] top-[-50px] z-10 h-0 w-0 select-none"
						style:transform-origin="50px 50px"
						style:transform="translate({transform.x}px,{transform.y}px) rotate({transform.rotate}deg)"
						transition:fade={{ duration: 50, easing: cubicOut }}
					>
						{#if $previewDecal === null}
							{#each corners as [xDir, yDir], c}
								<div
									style:transform="translate({transform.scale *
										((xDir * boundingBox.width) / 2) +
										5 * xDir}px,{transform.scale * ((yDir * boundingBox.height) / 2) +
										5 * yDir}px)"
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
										style:cursor={getCornerCursor(
											Math.abs(xDir + yDir),
											transform.rotate
										)}
									/>
								</div>
							{/each}
						{/if}
						<div
							style:transform="translate(0, {(transform.scale * boundingBox.height) / 2 +
								32 / canvasScale}px)"
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
			<!-- <div
				class="absolute left-0 top-0 h-[2px] w-full bg-teal-300"
				style:transform="translateY({canvasTop - 1}px)"
			/>
			<div
				class="absolute left-0 top-0 h-[2px] w-full bg-teal-300"
				style:transform="translateY({canvasBottom - 1}px)"
			/>
			<div
				class="absolute left-0 top-0 h-full w-[2px] bg-teal-300"
				style:transform="translateX({canvasLeft - 1}px)"
			/>
			<div
				class="absolute left-0 top-0 h-full w-[2px] bg-teal-300"
				style:transform="translateX({canvasRight - 1}px)"
			/> -->
		</div>
	</div>
	{#if $selectedSlot !== null && !transforming}
		{@const slot = $selectedSlot}
		<button
			in:fade={{ duration: 150, easing: cubicOut }}
			on:click|preventDefault={() => (snapping = !snapping)}
			class="glass-bg btn btn-circle absolute bottom-2 left-2 h-12 w-12 border-none !bg-opacity-40 text-2xl text-opacity-50 hover:!bg-opacity-70 hover:text-opacity-100 2xs:h-14 2xs:w-14 lg:bottom-4 lg:left-4 lg:h-16 lg:w-16 lg:p-4 lg:text-3xl"
			class:btn-secondary={snapping}
		>
			🧲
		</button>
		<button
			in:fade={{ duration: 150, easing: cubicOut }}
			on:click|preventDefault={() => {
				removeDecal(localCars, $designShortId, slot)
				selectedSlot.set(null)
				dirtyCanvas.set(true)
			}}
			class="glass-bg btn btn-circle absolute bottom-2 right-2 h-12 w-12 border-none !bg-opacity-40 text-2xl text-opacity-50 hover:bg-error hover:!bg-opacity-70 hover:text-opacity-100 2xs:h-14 2xs:w-14 lg:bottom-4 lg:right-4 lg:h-16 lg:w-16 lg:p-4 lg:text-3xl"
		>
			🗑️
		</button>
	{/if}
</div>
