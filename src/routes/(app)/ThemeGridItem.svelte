<script lang="ts">
	import { browser } from '$app/environment'
	import type { DesignCar } from '$lib/server/schemas/car'
	import type { ThemeName } from '$lib/themes'
	import { pluralize } from '$lib/util'
	import { Engine, Car } from 'grace-train-lib/components'
	import { flip } from 'svelte/animate'
	import Theme from '$lib/components/Theme.svelte'
	import Icon from '$lib/components/Icon.svelte'

	export let theme: ThemeName
	export let cars: DesignCar[] = []
	export let loading = false

	const maxCarsShown = 8
	const engineWidth = `${450 / 5}px`
	const carWidth = `${375 / 5}px`

	let shiftIndex = 0
	const shift = () => (shiftIndex = (shiftIndex + 1) % cars.length)
</script>

<div class="w-full">
	<div class="rounded-t-box relative h-[7.75rem] overflow-clip bg-base-200">
		{#if !loading}
			<div
				class="grid h-[7.75rem] items-end justify-center gap-2 px-5 pb-3"
				style:grid-template-columns="{engineWidth} repeat({cars.length || 1}, minmax(0, {carWidth}))"
			>
				<div class="z-[101]" style:width={engineWidth}>
					<Engine facing="left" />
				</div>
				{#if cars.length > 0}
					{#each cars
						.slice(shiftIndex, shiftIndex + maxCarsShown)
						.concat(cars.slice(0, shiftIndex))
						.slice(0, maxCarsShown) as car, c (car.id)}
						<div
							class="min-w-0 transition-[filter] duration-200 ease-out"
							style:filter="brightness({1 / (c + 1)})"
							animate:flip={{ duration: (d) => d * 5 }}
							style:z-index={100 - c}
						>
							<Car width={carWidth} car={{ depotCar: car }} />
						</div>
					{/each}
				{:else}
					TODO: Empty car
				{/if}
			</div>
			{#if cars.length > 1}
				<button
					on:click={shift}
					class="btn btn-circle btn-neutral btn-sm absolute right-3 top-2 z-[101] touch-manipulation border-opacity-50 bg-opacity-50 backdrop-blur-[2px]"
				>
					<Icon icon="upV" class="w-3 rotate-90" />
				</button>
			{/if}
		{:else}
			<div class="flex h-full items-center justify-center">
				<span class="loading loading-dots loading-lg animate-fade-in text-primary"></span>
			</div>
		{/if}
	</div>
	<div class="rounded-b-box flex items-stretch justify-around bg-neutral px-4 py-2 pl-1">
		<div class="flex max-w-48 grow flex-col items-center gap-1">
			<Theme {theme} small />
			<span class="leading-tight text-base-content/80">
				{#if !loading}
					{cars.length > 0 ? cars.length : 'no'}
					{pluralize(cars.length, 'car')}
				{:else}
					...
				{/if}
			</span>
		</div>
		<a
			href="/design/new?theme={encodeURIComponent(theme)}"
			class="btn btn-outline text-lg">New</a
		>
	</div>
</div>
