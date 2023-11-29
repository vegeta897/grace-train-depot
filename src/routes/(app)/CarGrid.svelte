<script lang="ts">
	import type { CarDataWithIds } from '$lib/server/schemas'
	import { Car } from 'grace-train-lib/components'

	export let cars: CarDataWithIds[]
</script>

<div class="grid grid-cols-[repeat(auto-fill,_minmax(8rem,_1fr))] gap-4">
	<slot />
	{#each cars as car}
		<a
			href="/c/{car.shortId}"
			data-sveltekit-preload-data="tap"
			class="flex flex-col items-center gap-1"
		>
			<div class="mt-[30%]"><Car {car} /></div>
			{#if car.name}
				<div class="badge badge-neutral badge-lg block max-w-full truncate">
					{car.name}
				</div>
			{/if}
		</a>
	{/each}
</div>
