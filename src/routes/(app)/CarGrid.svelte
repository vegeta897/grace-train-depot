<script lang="ts">
	import type { CarDataWithIds } from '$lib/server/schemas'
	import { getFadeGradient } from '$lib/util'
	import { Car } from 'grace-train-lib/components'
	import { tick } from 'svelte'

	export let cars: CarDataWithIds[]

	const fadeGradient = getFadeGradient('var(--b3)')
	const topGradient = `linear-gradient(to top, ${fadeGradient})`
	const bottomGradient = `linear-gradient(to bottom, ${fadeGradient})`

	let small = false
	let gridWidth: number
	let gridHeight: number
	let containerHeight: number

	let containerElement: HTMLDivElement

	$: scroll = gridHeight > containerHeight

	let expanded = false
	let fadeTop = 0
	let fadeBottom = 1

	function onScroll(scrollTop: number) {
		fadeTop = Math.min(1, scrollTop / 40)
		fadeBottom = 1 - Math.max(0, (scrollTop + containerHeight - (gridHeight - 40)) / 40)
	}

	async function onExpand() {
		expanded = !expanded
		if (expanded) {
			await tick() // Allow container to resize
			containerElement.scrollIntoView({ behavior: 'smooth' })
		} else {
			fadeTop = 0
			fadeBottom = 1
		}
	}
</script>

<div class="rounded-xl bg-base-200 p-4" bind:this={containerElement}>
	<div class="mb-2 flex items-center gap-4">
		<h2 class="text-xl font-black sm:text-3xl">my cars</h2>
		<button
			class="btn btn-square text-lg"
			class:btn-neutral={!small}
			class:btn-secondary={small}
			on:click={() => (small = !small)}>🔍</button
		>
		<a
			href="/design/new"
			data-sveltekit-preload-data="tap"
			class="btn btn-primary ml-auto text-lg font-black tracking-wide"
		>
			<!-- <Icon icon="plus" /> -->new
		</a>
	</div>
	<div class="relative">
		<div class="relative overflow-clip rounded-lg">
			<div
				class="max-h-[100vh]"
				class:overflow-clip={!expanded || !scroll}
				class:overflow-y-scroll={expanded && scroll}
				class:grid-expanded={expanded}
				class:grid-not-expanded={!expanded}
				style:--not-expanded-height={small ? '9rem' : '13.5rem'}
				style:--grid-width={small ? '5rem' : '8rem'}
				bind:clientHeight={containerHeight}
				on:scroll={(e) => onScroll(e.currentTarget.scrollTop)}
			>
				<div
					class="grid grid-cols-[repeat(auto-fill,_var(--grid-width))] justify-center pb-2"
					bind:clientWidth={gridWidth}
					bind:clientHeight={gridHeight}
				>
					{#each cars as car, c (car.id)}
						<a href="/c/{car.shortId}" data-sveltekit-preload-data="tap" class="group">
							<div
								class="flex shrink flex-col items-center gap-1 overflow-clip px-[5%] pt-2"
							>
								<div class="pt-[30%] transition-transform group-hover:-translate-y-2">
									<Car {car} />
								</div>
								<div
									class="badge badge-neutral block max-w-full truncate transition-all"
									class:opacity-0={!car.name || small}
									class:-translate-y-4={!car.name || small}
								>
									{car.name}
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
			<div
				class="pointer-events-none absolute top-0 h-12"
				style:background-image={topGradient}
				style:opacity={fadeTop}
				style:width="{gridWidth}px"
			></div>
			<div
				class="pointer-events-none absolute bottom-0"
				class:h-12={expanded}
				class:h-16={!expanded}
				style:background-image={bottomGradient}
				style:opacity={(scroll ? 1 : 0) * fadeBottom}
				style:width="{gridWidth}px"
			></div>
		</div>
		<div
			class="bottom-0 flex w-full items-center justify-center p-2"
			class:pb-0={expanded}
			class:absolute={!expanded}
		>
			{#if scroll || expanded}
				<button
					on:click={onExpand}
					class="btn btn-neutral text-xl font-black tracking-wide"
					>{expanded ? 'less' : 'more'}</button
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.grid-expanded {
		max-height: calc(100vh - 9rem); /* fallback */
		max-height: calc(100svh - 9rem);
	}

	.grid-not-expanded {
		max-height: var(--not-expanded-height);
	}
</style>
