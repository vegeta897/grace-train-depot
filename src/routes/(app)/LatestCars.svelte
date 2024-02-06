<script lang="ts">
	import type { DesignCar } from '$lib/server/schemas/car'
	import { Car } from 'grace-train-lib/components'

	export let cars: DesignCar[]
	export let count: number
</script>

<div class="w-full">
	<div class="rounded-t-box overflow-clip bg-base-200">
		{#await cars}
			loading...
		{:then cars}
			<div class="flex justify-center px-6 py-4">
				{#each cars as car}
					<a href="/c/{car.shortId}" class="group w-1/5">
						<div class="flex shrink flex-col items-center gap-1 overflow-x-clip">
							<div
								class="px-[10%] pt-[30%] transition-transform group-hover:-translate-y-1 group-hover:scale-110"
							>
								<Car car={{ depotCar: car }} />
							</div>
							<div
								class="max-w-full truncate transition-transform group-hover:translate-y-1"
							>
								{car.name}
							</div>
						</div>
					</a>
				{/each}
				<!-- {#if count > 5}
					<div class="flex flex-col items-center justify-center pt-2">
						<div class="text-4xl font-black">
							+{count - 5}
						</div>
						<div class="text-xl font-bold">more</div>
					</div>
				{/if} -->
			</div>
		{/await}
	</div>
	<div class="rounded-b-box flex items-center bg-neutral px-6 py-4">
		<h2 class="grow text-4xl font-black">your cars</h2>
		<a href="/cars" class="btn text-lg">View all</a>
	</div>
</div>
