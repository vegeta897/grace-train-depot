<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import UserCar from '$lib/components/UserCar.svelte'
	import { Star } from 'grace-train-lib'
	import { onMount } from 'svelte'

	const slots = [{ text: '⭐' }, {}, {}, {}, {}, {}]

	let decalPosition = { x: 0, y: 0 }
	let decalScale = 2
	let decalRotate = 0
	let dragPosition = { x: 62.5 + 375 / 2 - 50, y: 180 }
	let dragging = false

	function onDrag({ offsetX, offsetY }: DragEventData) {
		dragPosition = { x: offsetX, y: offsetY }
		updateDecalPosition()
	}
	const onDragStart = () => (dragging = true)
	const onDragEnd = () => (dragging = false)

	function updateDecalPosition() {
		decalPosition = {
			x: dragPosition.x - 62.5 + 50,
			y: dragPosition.y - 100 + 50,
		}
	}

	const scaleDecal = (amount: number) =>
		(decalScale = Math.max(0.5, decalScale + amount * 0.5))

	const rotateDecal = (amount: number) => (decalRotate += amount * 15)

	onMount(() => {
		updateDecalPosition()
	})
</script>

<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Decals</h1>
	<div class="relative mx-auto h-[400px] w-[400px] overflow-hidden">
		<div class="absolute left-[-50px] top-[-50px] h-[500px] w-[500px]">
			<div class="absolute left-[62.5px] top-[100px] w-[375px]">
				<UserCar>
					<Star
						translate={decalPosition}
						scale={decalScale}
						rotate={decalRotate}
						transition={!dragging}
					/>
				</UserCar>
			</div>
			<div
				use:draggable={{
					bounds: 'parent',
					position: dragPosition,
					onDrag,
					onDragStart,
					onDragEnd,
				}}
				class="absolute left-0 top-0 cursor-move opacity-20"
			>
				<svg
					class="overflow-visible transition-transform"
					viewBox="-50 -50 100 100"
					width="100"
					style:transform-origin="50px 50px"
					style:transform="rotate({decalRotate}deg) scale({decalScale})"
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
					<Star />
				</svg>
			</div>
		</div>
	</div>
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
	<div class="nunito mb-8 grid grid-flow-row grid-cols-2 gap-3">
		{#each slots as slot}
			<button class="btn-block btn-lg btn gap-4 text-4xl font-black">
				{slot.text || '+'}
			</button>
		{/each}
	</div>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
