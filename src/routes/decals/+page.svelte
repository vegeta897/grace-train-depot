<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import UserCar from '$lib/components/UserCar.svelte'
	import { Decal } from 'grace-train-lib'
	import { userCar } from '$lib/store'
	import type { Transform } from '$lib/util'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	import BoundingBox from './BoundingBox.svelte'
	import { DECAL_MAX_SCALE, DECAL_MIN_SCALE, updateDecalTransform } from './decals'
	import Controls from './Controls.svelte'

	const MAX_DECALS = 5

	let selectedDecalIndex: number | null = null
	let hoveredDecalIndex: number | null = null
	let clickOutsideCooldown = false
	let canvasElement: HTMLDivElement
	let userTrainContainer: HTMLDivElement

	let canvasScale: number = 0.635
	onMount(updateCanvasScale)
	function updateCanvasScale() {
		canvasScale = userTrainContainer.clientWidth / 464
	}

	$: userDecals = $userCar.decals
	$: dragTransforms = userDecals.map((d) => ({
		name: d.name,
		id: d.id,
		...d.transform,
		translate: { ...d.transform.translate },
	}))
	$: transforming = !!(dragging || resizing || rotating)

	function addDecal() {
		selectedDecalIndex = userDecals.length
		userCar.update((uc) => {
			uc.decals = [
				...uc.decals,
				{
					name: 'star',
					transform: { translate: { x: 375 / 2, y: 120 }, scale: 1, rotate: 0 },
					id: Date.now(),
					fill: '#f2ef0d',
				},
			]
			return uc
		})
	}

	let dragging: Transform['translate'] | null = null

	const onDragStart = (index: number) => {
		dragging = { ...dragTransforms[index].translate }
		selectedDecalIndex = index
	}
	function onDrag({ offsetX, offsetY }: DragEventData, index: number) {
		if (!dragging) return
		dragTransforms[index].translate = {
			x: dragging.x + (offsetX - dragging.x) / canvasScale,
			y: dragging.y + (offsetY - dragging.y) / canvasScale,
		}
		updateDecalTransform(index, dragTransforms[index])
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
		snap: boolean
		calcRotate: (x: number, y: number) => number
	} | null = null
	function startResize(corner: number) {
		if (selectedDecalIndex === null) return
		const transform = dragTransforms[selectedDecalIndex]
		const canvasBox = canvasElement.getBoundingClientRect()
		const originX = canvasBox.x + (transform.translate.x + 62.5) * canvasScale
		const originY = canvasBox.y + transform.translate.y * canvasScale
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
		if (selectedDecalIndex === null) return
		const transform = dragTransforms[selectedDecalIndex]
		const canvasBox = canvasElement.getBoundingClientRect()
		const originX = canvasBox.x + (transform.translate.x + 62.5) * canvasScale
		const originY = canvasBox.y + transform.translate.y * canvasScale
		rotating = {
			index: selectedDecalIndex,
			transform,
			snap: snapRotation(transform.rotate) === false ? false : true,
			calcRotate: (x: number, y: number) => {
				let angle = Math.atan2(y - originY, x - originX) * (180 / Math.PI) - 90
				const snapped = snapRotation(angle)
				rotating!.snap = false
				if (snapped !== false) {
					angle = snapped
					rotating!.snap = true
				}
				return angle
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
	function onPointerUp() {
		if (!resizing && !rotating) return
		resizing = null
		rotating = null
		clickOutsideCooldown = true
		setTimeout(() => (clickOutsideCooldown = false), 100)
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
	<div
		class="relative mx-auto my-4 min-h-[190px] w-full overflow-hidden"
		style:height="{300 * canvasScale || 0}px"
		style="transition: height 150ms ease-out"
		bind:this={userTrainContainer}
	>
		<div
			class="absolute h-[300px] w-[500px] origin-top"
			style:left="calc((100% - 500px) / 2)"
			style:transform="scale({canvasScale})"
			style="transition: transform 150ms ease-out, left 150ms ease-out"
			bind:this={canvasElement}
		>
			<div class="relative mx-auto w-[375px]">
				<UserCar transition={['fill', 'opacity']} />
			</div>
			{#each dragTransforms as transform, d (transform.id)}
				<div
					class="absolute left-[62.5px] top-0 h-0 w-0"
					class:z-10={selectedDecalIndex === d}
					use:draggable={{
						bounds: 'parent',
						position: transform.translate,
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
							class:opacity-40={selectedDecalIndex !== d && hoveredDecalIndex === d}
						>
							<BoundingBox
								scale={transform.scale}
								selected={selectedDecalIndex === d}
								{transforming}
							/>
							<g
								class:transition-opacity={selectedDecalIndex !== d &&
									hoveredDecalIndex !== d}
								class:opacity-25={selectedDecalIndex === d}
							>
								<Decal
									name={transform.name}
									fill={userDecals[d].fill}
									transition={['fill', 'opacity']}
								/>
							</g>
						</svg>
					</button>
				</div>
			{/each}
			{#if selectedDecalIndex !== null}
				{@const transform = dragTransforms[selectedDecalIndex]}
				{#key transform.id}
					<div
						class="pointer-events-none absolute left-[12.5px] top-[-50px] z-10 h-[100px] w-[100px]"
						style:transform="translate({transform.translate.x}px,{transform.translate
							.y}px) rotate({transform.rotate}deg)"
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
				{/key}
			{/if}
		</div>
	</div>
	{#if selectedDecalIndex !== null}
		{@const index = selectedDecalIndex}
		<Controls
			{index}
			{userDecals}
			{dragTransforms}
			setSelectedIndex={(i) => (selectedDecalIndex = i)}
		/>
	{/if}

	{#if userDecals.length < MAX_DECALS}
		<button
			class="nunito btn-block btn-lg btn mb-4 h-20 text-5xl font-black"
			on:click={addDecal}
		>
			+
		</button>
	{/if}
	<!-- Maybe don't need drag n drop or hover layers, or drag n drop and delete mode -->
	<!-- Prefer using buttons under canvas for deleting and re-ordering -->
	<ol class="nunito mb-8 flex flex-col-reverse gap-4 rounded-lg">
		{#each userDecals as decal, d (decal.id)}
			<li
				class:outline={d === selectedDecalIndex}
				class:outline-4={d === selectedDecalIndex}
				class:outline-primary={d === selectedDecalIndex}
				class="btn-group w-full rounded-lg"
			>
				<button
					class="btn-lg btn h-24 grow"
					on:click={() => (selectedDecalIndex = d === selectedDecalIndex ? null : d)}
					on:mouseenter={() => (hoveredDecalIndex = d)}
					on:mouseleave={() => (hoveredDecalIndex = null)}
					on:focus={() => (hoveredDecalIndex = d)}
					on:blur={() => (hoveredDecalIndex = null)}
				>
					<svg viewBox="-50 -50 100 100" class="w-14">
						<Decal name={decal.name} fill={decal.fill} transition={['fill', 'opacity']} />
					</svg>
				</button>
			</li>
		{/each}
	</ol>
	<a href=".." class="btn-block btn-lg btn text-xl"> Done </a>
	<div
		class="absolute left-0 top-0 h-[3px] w-[3px] rounded-sm bg-red-600"
		style:transform="translate({testDot.x - 1.5}px,{testDot.y - 1.5}px)"
	/>
</section>
