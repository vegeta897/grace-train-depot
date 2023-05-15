<script lang="ts">
	import { draggable, type DragEventData } from '@neodrag/svelte'
	import UserCar from '$lib/components/UserCar.svelte'
	import { Star } from 'grace-train-lib'
	import { onMount } from 'svelte'

	const slots = [{ text: '⭐' }, {}, {}, {}, {}, {}]

	let decalPosition = { x: 0, y: 0 }
	let decalScale = 2
	let decalRotate = 0
	let dragPosition = { x: 62.5 + 375 / 2 - 50 * decalScale - 4, y: 100 }

	function onDrag({ offsetX, offsetY }: DragEventData) {
		dragPosition = { x: offsetX, y: offsetY }
		updateDecalPosition()
	}

	function updateDecalPosition() {
		decalPosition = {
			x: dragPosition.x - 62.5 + 50 * decalScale + 4,
			y: dragPosition.y - 100 + 50 * decalScale + 4,
		}
	}

	function changeDecalScale(amount: number) {
		const prevScale = decalScale
		decalScale = Math.max(0.5, decalScale + amount * 0.5)
		dragPosition.x -= (decalScale - prevScale) * 50
		dragPosition.y -= (decalScale - prevScale) * 50
		updateDecalPosition()
	}

	function rotateDecal(amount: number) {
		decalRotate = (decalRotate + amount * 15) % 360
	}

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
					<Star translate={decalPosition} scale={decalScale} rotate={decalRotate} />
				</UserCar>
			</div>
			<div
				use:draggable={{ bounds: 'parent', position: dragPosition, onDrag }}
				class="absolute left-0 top-0 box-border cursor-move rounded-md border-4 border-dashed opacity-30"
			>
				<svg viewBox="-50 -50 100 100" width={100 * decalScale}
					><Star rotate={decalRotate} /></svg
				>
			</div>
		</div>
	</div>
	<p>{decalPosition.x}, {decalPosition.y}</p>
	<div class="nunito my-4 flex space-x-2">
		<button on:click={() => changeDecalScale(-1)} class="btn-lg btn text-3xl">-</button>
		<button on:click={() => changeDecalScale(1)} class="btn-lg btn text-3xl">+</button>
		<button on:click={() => rotateDecal(-1)} class="btn-lg btn text-3xl"
			>&circlearrowleft;</button
		>
		<button on:click={() => rotateDecal(1)} class="btn-lg btn text-3xl"
			>&circlearrowright;</button
		>
	</div>
	<div class="nunito mb-8 grid grid-flow-row grid-cols-2 gap-3">
		{#each slots as slot}
			<button class="btn-block btn-lg btn gap-4 text-4xl"> {slot.text || '+'} </button>
		{/each}
	</div>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
