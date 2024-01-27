<script lang="ts">
	// import type { PageData } from './$types'
	import { getDesignStores } from './stores'
	import { browser } from '$app/environment'
	import { Car } from 'grace-train-lib/components'
	import { getCarViewBox } from '$lib/car'

	// export let data: PageData

	const { designCar, designShortId } = getDesignStores()
</script>

<!-- TODO: Side by side layout in lg: view, like other design pages
Make a unified layout component (with multiple slots, not a sveltekit layout) -->
<section class="flex flex-col items-center gap-4">
	{#if browser}
		<div class="w-48 lg:w-64">
			<Car car={{ depotCar: $designCar }} viewBox={getCarViewBox($designCar)} />
		</div>
		<h3 class="text-3xl font-black">{$designCar.name}</h3>
	{/if}
	<div class="rounded-box flex flex-col items-center gap-4 bg-neutral p-6">
		{#if $designShortId === 'new'}
			<p class="text-xl">let's design a Grace Train car!</p>
			<p>start with the basics:</p>
			<a class="btn btn-lg font-black" href="/design/{$designShortId}/body"
				><span class="relative top-[-3px] text-2xl">🚌</span> Pick a Body</a
			>
		{:else}
			<!-- TODO: Suggest a page based on existing design -->
			<p class="text-xl">how about a new set of wheels?</p>
			<a class="btn btn-lg" href="/design/{$designShortId}/wheels"
				><span class="relative text-2xl">🎡</span> Wheels</a
			>
		{/if}
	</div>
</section>
