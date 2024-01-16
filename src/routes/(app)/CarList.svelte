<script lang="ts">
	import type { CarDataWithIds } from '$lib/server/schemas/car'
	import { getSideFadeGradient } from '$lib/util'
	import { Car } from 'grace-train-lib/components'

	export let cars: CarDataWithIds[]
	export let size = 1

	const baseWidth = 146 // Car width (incl padding) in pixels
	const sideFadePercent = 5
	const sideFadeGradient = getSideFadeGradient(sideFadePercent)

	let startIndex = 0
	let containerWidth: number

	$: wholeCars = Math.max(1, Math.floor(containerWidth / (baseWidth * size))) // How many cars fit in container

	const getSafeIndex = (index: number) =>
		Math.max(0, Math.min(cars.length - wholeCars, index))

	function changePage(page: number) {
		startIndex = getSafeIndex(startIndex + page * wholeCars)
	}

	// TODO: Page buttons are kind of clunky
	// How do do you quickly get to the end, or middle, of a large list of cars?
	// Would be better if you could expand to a grid view
	// A big custom scroll bar could work, but custom scroll bars in general are usually bad
</script>

{startIndex + 1} - {startIndex + wholeCars} of {cars.length}
<div
	class="mb-4 overflow-x-clip"
	style:padding-right="{sideFadePercent}%"
	style:padding-left="{sideFadePercent}%"
	style:-webkit-mask={sideFadeGradient}
	style:mask={sideFadeGradient}
>
	<div
		class="relative w-full"
		style:height="{size * baseWidth * 1.2}px"
		style:transition="height 300ms cubic-bezier(0.4, 0, 0.2, 1)"
		bind:clientWidth={containerWidth}
	>
		{#each cars as car, c (car.id)}
			<a
				href="/c/{car.shortId}"
				data-sveltekit-preload-data="tap"
				class="group absolute left-0 top-0 origin-top-left transform transition-transform"
				style:--tw-translate-x="{(c - startIndex) * size * baseWidth}px"
				style:--tw-scale-x={size}
				style:--tw-scale-y={size}
				style:transition-duration="300ms"
			>
				<div
					style:width="{baseWidth}px"
					class="flex shrink flex-col items-center gap-1 px-[5%]"
				>
					<div class="mt-[30%] transition-transform group-hover:-translate-y-2">
						<Car car={{ depotCar: car }} />
					</div>
					<div
						class="badge badge-neutral block max-w-full truncate transition-all"
						class:opacity-0={size < 1}
						class:-translate-y-4={size < 1}
					>
						{car.name}
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
<div class="flex w-full items-center justify-between gap-2">
	<button
		on:click={() => changePage(-1)}
		disabled={startIndex === 0}
		class="btn btn-neutral btn-lg text-2xl font-black">&lt;</button
	>
	<slot />
	<button
		on:click={() => changePage(1)}
		disabled={startIndex + wholeCars >= cars.length}
		class="btn btn-neutral btn-lg text-2xl font-black">&gt;</button
	>
</div>
