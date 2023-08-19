<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import { wrapNumber } from '$lib/util'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { fade } from 'svelte/transition'
	import { Decal } from 'grace-train-lib'
	import BoundingBox from './BoundingBox.svelte'
	import { DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { getDecalStores } from './stores'
	import Car from '$lib/components/Car.svelte'
	import type { Transform } from '$lib/types'
	import type { CarDataWithIds } from '$lib/schemas'
	import { updateDecalTransform } from './decals'
	import { getDesignStores } from '../../stores'
	import { browser } from '$app/environment'

	export let car: CarDataWithIds

	const { localCars, designShortId, designCar } = getDesignStores()
	const { hoveredSlot, selectedSlot } = getDecalStores()

	$: draggables = $designCar.decals.map((d) => ({ id: d.id, ...d.transform }))

	let clickOutsideCooldown = false

	let containerElement: HTMLDivElement
	let canvasElement: HTMLDivElement

	let containerWidth: number
	let macroView = false
	$: canvasScale = containerWidth / 525 / (macroView ? 2 : 1)

	$: transforming = !!(dragging || resizing || rotating)

	let dragging: Transform | null = null

	const onDragStart = (slot: number) => {
		dragging = { ...draggables[slot] }
		selectedSlot.set(slot)
	}

	function onDrag({ offsetX, offsetY }: DragEventData, slot: number) {
		if (!dragging) return
		const transform = draggables[slot]
		transform.x = dragging.x + (offsetX - dragging.x) / canvasScale
		transform.y = dragging.y + (offsetY - dragging.y) / canvasScale
		updateDecalTransform(localCars, $designShortId, slot, transform)
	}

	const onDragEnd = () => {
		dragging = null
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
		const originX = canvasBox.x + (100 + transform.x) * canvasScale
		const originY = canvasBox.y + (100 + transform.y) * canvasScale
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
					Math.min(DECAL_MAX_SCALE, (avgDistance - 14) / 50)
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
		const originX = canvasBox.x + (100 + transform.x) * canvasScale
		const originY = canvasBox.y + (100 + transform.y) * canvasScale
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
		clickOutsideCooldown = true
		setTimeout(() => (clickOutsideCooldown = false), 100)
	}
</script>

<svelte:window on:pointermove={onPointerMove} on:pointerup={onPointerUp} />
<div class="relative">
	<div
		class="relative mx-auto grid max-w-[575px] overflow-clip lg:p-8"
		style:aspect-ratio="8 / 5"
		bind:clientWidth={containerWidth}
		bind:this={containerElement}
	>
		<div
			style:left="calc(50% - calc(575px / 2))"
			style:top="calc(40% - calc(440px / 2))"
			class="absolute h-[430px] w-[575px] px-[80px] pb-[50px] pt-[20px] transition-transform"
			class:hidden={!browser}
			style:transform="scale({canvasScale})"
			bind:this={canvasElement}
		>
			<Car
				{car}
				focusTopperSlot={$selectedSlot === null ? null : -1}
				transition={['fill', 'opacity']}
				focusDecalZone={$selectedSlot !== null}
			/>
			{#each draggables as transform, d (transform.id)}
				<div
					class="absolute left-[100px] top-[100px] h-0 w-0"
					class:z-10={$selectedSlot === d}
					use:draggable={{
						bounds: 'parent',
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
						on:mouseenter={() => !dragging && hoveredSlot.set(d)}
						on:mouseleave={() => hoveredSlot.set(null)}
						on:focus={() => hoveredSlot.set(d)}
						on:blur={() => hoveredSlot.set(null)}
						on:clickoutside={() => selectedSlot.set(null)}
						on:click|stopPropagation
						out:fade|local={{ duration: 150 }}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="w-full overflow-visible"
							viewBox="-50 -50 100 100"
							class:transition-opacity={$selectedSlot !== d && $hoveredSlot !== d}
							class:opacity-0={$selectedSlot !== d && $hoveredSlot !== d}
							class:opacity-25={$selectedSlot !== d && $hoveredSlot === d}
						>
							<BoundingBox
								scale={transform.scale}
								selected={$selectedSlot === d}
								strokeWidthScale={macroView ? 2 : 1}
								{transforming}
							/>
							<g
								class:transition-opacity={$selectedSlot !== d && $hoveredSlot !== d}
								class:opacity-25={$selectedSlot === d}
							>
								<Decal
									name={$designCar.decals[d].name}
									fill={$designCar.decals[d].fillPreview || $designCar.decals[d].fill}
									transition={['fill', 'opacity']}
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
						class="pointer-events-none absolute z-10 h-0 w-0"
						style:top="{50}px"
						style:left="{50}px"
						style:transform-origin="50px 50px"
						style:transform="translate({transform.x}px,{transform.y}px) rotate({transform.rotate}deg)"
						transition:fade={{ duration: 50 }}
					>
						{#each corners as [xDir, yDir], c}
							<div
								style:transform="translate({((transform.scale - 1) * 50 + 64) *
									xDir}px,{((transform.scale - 1) * 50 + 64) * yDir}px)"
							>
								<button
									on:pointerdown={() => startResize(c)}
									style:transform="scale({((resizing && getCornerScale(c)) ||
										(rotating || dragging ? 0.5 : 1)) * (macroView ? 2 : 1)})"
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
							style:transform="translate(0, {(transform.scale - 1) * 50 +
								100 * (macroView ? 1.25 : 1)}px)"
						>
							<button
								on:pointerdown={() => startRotate()}
								style:transform="scale({(rotating ? 1.5 : 1) * (macroView ? 2 : 1)})"
								class="pointer-events-auto absolute left-[34px] top-[34px] h-8 w-8 origin-center touch-none rounded-2xl border-5 border-white bg-secondary"
								class:transition-all={!resizing}
								class:opacity-60={rotating}
								class:opacity-0={resizing || dragging}
							/>
						</div>
					</div>
				{/key}
			{/if}
		</div>
	</div>
	<button
		on:click={() => (macroView = !macroView)}
		style:backdrop-filter="blur(4px)"
		style:--tw-bg-opacity="0.6"
		class="btn absolute right-0 top-0 h-14 w-14 border-none p-0 text-3xl"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="inline-block h-7 w-7 stroke-current"
		>
			<path
				class="origin-center transition-transform"
				style:transform="scale({macroView ? 1 : -1})"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="6"
				vector-effect="non-scaling-stroke"
				d="M21,3 L3,21 M21,3 h-10 M21,3 v10"
			/>
		</svg>
	</button>
</div>
