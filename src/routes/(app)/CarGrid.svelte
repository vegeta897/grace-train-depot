<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import type { DesignCar } from '$lib/server/schemas/car'
	import { getFadeGradient } from '$lib/util'
	import { Car } from 'grace-train-lib/components'
	import { tick } from 'svelte'

	export let cars: Promise<DesignCar[]>

	const fadeGradient = getFadeGradient('var(--b3)')
	const topGradient = `linear-gradient(to top, ${fadeGradient})`
	const bottomGradient = `linear-gradient(to bottom, ${fadeGradient})`

	let small = false
	let gridInnerHeight: number
	let gridOuterHeight: number

	let containerElement: HTMLDivElement

	$: overflow = gridInnerHeight > gridOuterHeight

	let expanded = false
	let fadeTop = 0
	let fadeBottom = 1

	function onScroll(scrollTop: number) {
		fadeTop = Math.min(1, scrollTop / 40)
		fadeBottom =
			1 - Math.max(0, (scrollTop + gridOuterHeight - (gridInnerHeight - 40)) / 40)
	}

	async function onExpand() {
		expanded = !expanded
		if (expanded) {
			await tick() // Allow container to resize
			containerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
		} else {
			fadeTop = 0
			fadeBottom = 1
		}
	}
</script>

<div class="rounded-xl bg-base-200" class:min-h-64={!small} bind:this={containerElement}>
	<div class="mb-2 flex items-center gap-6 p-4">
		<h2 class="text-xl font-black sm:text-3xl">my cars</h2>
		<div class="flex items-center gap-2">
			<Icon icon="grid-large" class="size-4" />
			<input
				type="checkbox"
				class="toggle border-opacity-100 bg-opacity-100"
				bind:checked={small}
			/>
			<Icon icon="grid-small" class="size-4" />
		</div>
		<a
			href="/design/new"
			data-sveltekit-preload-data="tap"
			class="btn btn-primary ml-auto text-lg"
		>
			<!-- <Icon icon="plus" /> -->new
		</a>
	</div>
	{#await cars}
		<div class="flex h-32 items-center justify-center">
			<span class="loading loading-dots loading-lg animate-fade-in text-primary"></span>
		</div>
	{:then cars}
		<div class="relative" class:pb-6={!expanded && !overflow}>
			<div class="relative overflow-clip" class:rounded-b-xl={!expanded}>
				<div
					class="max-h-[100vh]"
					class:overflow-clip={!expanded || !overflow}
					class:overflow-y-scroll={expanded && overflow}
					class:grid-expanded={expanded}
					class:grid-not-expanded={!expanded}
					style:--not-expanded-height={small ? '12rem' : '14rem'}
					style:--grid-width={small ? '5rem' : '8rem'}
					bind:clientHeight={gridOuterHeight}
					on:scroll={(e) => onScroll(e.currentTarget.scrollTop)}
				>
					<div
						class="grid grid-cols-[repeat(auto-fill,_var(--grid-width))] justify-center px-1 xs:px-2"
						bind:clientHeight={gridInnerHeight}
					>
						{#each cars as car (car.id)}
							<a href="/c/{car.shortId}" data-sveltekit-preload-data="tap" class="group">
								<div class="flex shrink flex-col items-center gap-1 overflow-clip">
									<div
										class="px-[10%] pt-[30%] transition-transform group-hover:-translate-y-2"
									>
										<Car car={{ depotCar: car }} />
									</div>
									{#if !small}
										<div class="badge badge-neutral block max-w-full truncate">
											{car.name}
										</div>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				</div>
				<div
					class="pointer-events-none absolute top-0 h-12 w-full"
					style:background-image={topGradient}
					style:opacity={fadeTop}
				></div>
				<div
					class="pointer-events-none absolute bottom-0 w-full"
					class:h-12={expanded}
					class:h-20={!expanded && !small}
					class:h-28={!expanded && small}
					style:background-image={bottomGradient}
					style:opacity={(overflow ? 1 : 0) * fadeBottom}
				></div>
			</div>
			<div
				class="bottom-0 flex w-full items-center justify-center p-4"
				class:absolute={!expanded}
			>
				{#if overflow || expanded}
					<button on:click={onExpand} class="btn btn-neutral min-h-12"
						>{expanded ? 'show less' : 'show more'}</button
					>
				{/if}
			</div>
		</div>
	{:catch error}
		<div class="flex h-32 items-center justify-center">
			<div class="alert alert-error">error loading your cars, try reloading the page</div>
		</div>
	{/await}
</div>

<style>
	.grid-expanded {
		max-height: calc(100vh - 14rem); /* fallback */
		max-height: calc(100svh - 14rem);
	}

	.grid-not-expanded {
		max-height: var(--not-expanded-height);
	}
</style>
