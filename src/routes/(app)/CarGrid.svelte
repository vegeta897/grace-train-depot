<script lang="ts">
	import { browser } from '$app/environment'
	import type { CarDataWithIds } from '$lib/server/schemas'
	import { Car } from 'grace-train-lib/components'
	import { afterUpdate, onMount } from 'svelte'

	export let cars: CarDataWithIds[]
	export let size = 8

	let gridElement: HTMLDivElement
	let gridStyle: CSSStyleDeclaration
	let gridColumns = browser ? 6 : 0 // Start at max number of cars that can be seen at default size
	let startIndex = 0
	let rowHeight = 158 // Default height for SSR

	$: truncatedCars = cars.slice(startIndex, startIndex + gridColumns)

	function updateGridColumns() {
		if (!gridStyle) return
		gridColumns = gridStyle.getPropertyValue('grid-template-columns').split(' ').length
		startIndex = getSafeIndex(startIndex)
	}

	const getSafeIndex = (index: number) =>
		Math.max(0, Math.min(cars.length - 1 - gridColumns, index))

	function changePage(page: number) {
		startIndex = getSafeIndex(startIndex + page * gridColumns)
	}

	onMount(() => {
		gridStyle = getComputedStyle(gridElement) // This is a live-updating object
		updateGridColumns()
	})
	// afterUpdate is used so the new grid layout is ready after size changes
	afterUpdate(updateGridColumns)
</script>

<svelte:window on:resize={updateGridColumns} />
<div
	bind:this={gridElement}
	class="mb-2 grid overflow-clip"
	style:height="{rowHeight}px"
	style:grid-template-columns="repeat(auto-fill, minmax({size}rem, 1fr))"
>
	{#each truncatedCars as car (car.id)}
		<a href="/c/{car.shortId}" data-sveltekit-preload-data="tap" class="group">
			<div
				bind:offsetHeight={rowHeight}
				class="flex shrink flex-col items-center gap-1 px-[5%]"
			>
				<div class="mt-[30%] transition-transform group-hover:-translate-y-2">
					<Car {car} />
				</div>
				<div
					class="badge badge-neutral block max-w-full truncate"
					class:badge-lg={size >= 10}
					class:badge-sm={size <= 6}
					class:hidden={size < 6}
					class:invisible={!car.name}
				>
					{car.name}
				</div>
			</div>
		</a>
	{/each}
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
		disabled={startIndex + gridColumns >= cars.length - 1}
		class="btn btn-neutral btn-lg text-2xl font-black">&gt;</button
	>
</div>
