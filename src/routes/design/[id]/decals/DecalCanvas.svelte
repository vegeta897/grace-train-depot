<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import { wrapNumber } from '$lib/util'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { fade } from 'svelte/transition'
	import { Decal } from 'grace-train-lib'
	import BoundingBox from './BoundingBox.svelte'
	import { DECAL_MAX_SCALE, DECAL_MIN_SCALE } from '$lib/common/constants'
	import { getDecalStores } from './stores'
	import UserCar from '$lib/components/UserCar.svelte'
	import type { Car, Transform } from '$lib/types'
	import { updateDecalTransform } from './decals'
	import { getDesignStores } from '../../stores'

	export let car: Car

	const { localCars, designShortId, displayCar } = getDesignStores()
	const { hoveredSlot, selectedSlot } = getDecalStores()

	$: draggables = $displayCar.decals.map((d) => ({ id: d.id, ...d.transform }))

	let clickOutsideCooldown = false

	let canvasElement: HTMLDivElement

	let userCarWidth: number
	$: canvasScale = userCarWidth / 375

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
		if ($selectedSlot === null) return
		// const decal = decals[$selectedSlot]
		// if (decal) updateDecal(data.car.id, decal.id, decal)
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
		const originX = canvasBox.x + transform.x * canvasScale
		const originY = canvasBox.y + transform.y * canvasScale
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
		const originX = canvasBox.x + transform.x * canvasScale
		const originY = canvasBox.y + transform.y * canvasScale
		rotating = {
			slot: $selectedSlot,
			transform,
			snap: snapRotation(transform.rotate) === false ? false : true,
			calcRotate: (x: number, y: number) => {
				let angle = Math.atan2(y - originY, x - originX) * (180 / Math.PI) - 90
				angle = wrapNumber(angle, 0, 360)
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
		// const decalSlot = (resizing?.slot || rotating?.slot)!
		resizing = null
		rotating = null
		clickOutsideCooldown = true
		setTimeout(() => (clickOutsideCooldown = false), 100)
		// const decal = decals[decalSlot]
		// if (decal) await updateDecal(data.car.id, decal.id, decal)
	}
</script>

<svelte:window on:pointermove={onPointerMove} on:pointerup={onPointerUp} />
<div class="relative mx-auto max-w-[375px] overflow-clip" style:aspect-ratio="375/300">
	<div class="relative mx-auto w-full" bind:this={canvasElement}>
		<UserCar
			{car}
			decalsOverride={$displayCar.decals}
			transition={['fill', 'opacity']}
			focusDecalZone={$selectedSlot !== null}
			bind:width={userCarWidth}
		/>
		<div
			class="absolute left-0 top-0 h-[300px] w-[375px] origin-top-left"
			style:transform="scale({canvasScale})"
		>
			{#each draggables as transform, d (transform.id)}
				<div
					class="absolute h-0 w-0"
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
							limit: { parent: canvasElement },
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
								{transforming}
							/>
							<g
								class:transition-opacity={$selectedSlot !== d && $hoveredSlot !== d}
								class:opacity-25={$selectedSlot === d}
							>
								<Decal
									name={$displayCar.decals[d].name}
									fill={$displayCar.decals[d].fillPreview || $displayCar.decals[d].fill}
									transition={['fill', 'opacity']}
								/>
							</g>
						</svg>
					</button>
				</div>
			{/each}
			{#if $selectedSlot !== null}
				{@const transform = draggables[$selectedSlot]}
				<div
					class="pointer-events-none absolute left-[-50px] top-[-50px] z-10 h-[100px] w-[100px]"
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
								style:transform="scale({(resizing && getCornerScale(c)) ||
									(rotating || dragging ? 0.5 : 1)})"
								class="pointer-events-auto absolute left-[34px] top-[34px] h-8 w-8 origin-center touch-none rounded-2xl border-5 border-white bg-primary"
								class:transition-transform={!resizing}
								class:transition-opacity={!resizing}
								class:opacity-30={transforming}
								class:!opacity-60={resizing?.corner === c}
								style:cursor={getCornerCursor(Math.abs(xDir + yDir), transform.rotate)}
							/>
						</div>
					{/each}
					<div style:transform="translate(0,{(transform.scale - 1) * 50 + 100}px)">
						<button
							on:pointerdown={() => startRotate()}
							style:transform="scale({rotating ? 1.5 : 1})"
							class="pointer-events-auto absolute left-[34px] top-[34px] h-8 w-8 origin-center touch-none rounded-2xl border-5 border-white bg-secondary"
							class:transition-all={!resizing}
							class:opacity-60={rotating}
							class:opacity-0={resizing || dragging}
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
