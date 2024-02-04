<script lang="ts">
	import type { DesignCar } from '$lib/server/schemas/car'
	import { THEMES } from '$lib/themes'
	import ThemeGridItem from './ThemeGridItem.svelte'

	export let cars: DesignCar[]
</script>

<div class="grid grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))] gap-4 sm:gap-6">
	{#each THEMES as theme}
		{@const themeCars = cars
			.filter((car) => car.themes.includes(theme))
			.sort((a, b) => a.themes.length - b.themes.length)}
		<div class="w-full">
			<ThemeGridItem cars={themeCars} {theme} />
		</div>
	{/each}
</div>
