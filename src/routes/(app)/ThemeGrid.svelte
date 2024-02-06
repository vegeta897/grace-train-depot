<script lang="ts">
	import type { DesignCar } from '$lib/server/schemas/car'
	import { THEMES } from '$lib/themes'
	import ThemeGridItem from './ThemeGridItem.svelte'

	export let cars: Promise<DesignCar[]>

	$: themeCars = cars.then((cars) =>
		THEMES.map((theme) => ({
			theme,
			cars: cars
				.filter((car) => car.themes.includes(theme))
				.sort((a, b) => a.themes.length - b.themes.length),
		}))
	)
	$: completed = themeCars.then(
		(themeCars) => themeCars.filter(({ cars }) => cars.length > 0).length
	)

	let showInfo = false
</script>

<div class="flex items-center gap-3">
	<h2 class="text-2xl font-bold">🚦 themes</h2>
	<button
		on:click={() => (showInfo = !showInfo)}
		class="btn btn-circle btn-sm size-10 text-lg"
		class:btn-primary={showInfo}
	>
		?
	</button>
</div>
{#if showInfo}
	<div
		class="alert rounded-none border-none bg-neutral px-2 leading-snug sm:rounded-box sm:gap-6 sm:px-6 sm:text-lg"
	>
		<div class="w-6 text-4xl font-black">🚦</div>
		<div>
			<p>
				every car you create is automatically tagged with
				<strong class="text-primary">themes</strong> based on its design
			</p>
			<p class="mt-2">
				gracing during
				<strong class="text-primary">themed grace trains</strong>
				will call any cars that match that train's theme
			</p>
			<p class="mt-2">
				you can prepare for any train by designing one or more cars for each theme!
			</p>
		</div>
		<button on:click={() => (showInfo = false)} class="btn">ok</button>
	</div>
{/if}
<p>This is kinda not great</p>
<p>It won't scale up well with more tags</p>
<p>It's cramped and busy and there's too many NEW buttons</p>
<p>The car scrolling is kinda neat but not very usable</p>
<p>Maybe have a theme selector and just show one train at a time</p>
<p>Figure out how to handle many cars in one row on mobile</p>
{#await completed}
	<p>...</p>
{:then completed}
	<p class="font-bold">{completed} of {THEMES.length} completed</p>
{/await}
<div class="grid grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))] gap-4 sm:gap-6">
	{#await themeCars}
		{#each THEMES as theme}
			<ThemeGridItem loading {theme} />
		{/each}
	{:then themeCars}
		{#each themeCars as { theme, cars }}
			<ThemeGridItem {cars} {theme} />
		{/each}
	{/await}
</div>
