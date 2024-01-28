<script lang="ts" context="module">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'

	export type ModPageTrain = PageData['trains'][number]
	export type ModPageTrainCar = ModPageTrain['cars'][number]
</script>

<script lang="ts">
	export let train: ModPageTrain
	export let selectedCar: ModPageTrainCar | null
</script>

<ol class="flex overflow-x-scroll rounded-lg bg-base-200 p-2">
	{#each train.cars as car (car.index)}
		<li class:opacity-50={car.hidden} class:saturate-50={car.hidden}>
			<a
				href="?t={train.id}&i={car.index}"
				class="group flex w-[7.5rem] shrink-0 flex-col items-center gap-1 overflow-clip rounded-md px-2 pb-1 pt-3 transition-all"
				class:bg-neutral={car === selectedCar}
				class:outline={car === selectedCar}
			>
				<div class="transition-transform group-hover:-translate-y-2">
					<Car car={car.carData} />
				</div>
				<div
					class="overflow-hidden text-wrap break-words text-center text-sm leading-none text-base-content/90"
				>
					{car.user?.twitchDisplayName || 'deleted user'}
				</div>
			</a>
		</li>
	{/each}
	{#if train.truncatedCars > 0}
		<li class="w-32 shrink-0 px-3 py-8 text-base-content/70">
			{train.truncatedCars} older cars not shown
		</li>
	{/if}
</ol>
