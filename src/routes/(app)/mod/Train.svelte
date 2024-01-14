<script lang="ts" context="module">
	export type Train = {
		id: number
		ended: boolean
		cars: {
			index: number
			addedAt: Date
			carData: GraceTrainCar
			user: {
				twitchUsername: string
				twitchDisplayName: string
			} | null
		}[]
	}
</script>

<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { GraceTrainCar } from 'grace-train-lib/trains'

	export let train: Train
</script>

<ol class="flex gap-4 overflow-x-scroll rounded-lg bg-base-200 px-4 py-2">
	{#each train.cars as car}
		<li class="w-24 shrink-0 overflow-clip pt-2">
			<Car car={car.carData} />
			<div
				class="overflow-hidden text-wrap break-words text-center text-sm leading-none text-base-content/90"
			>
				{car.user?.twitchDisplayName || 'deleted user'}
			</div>
		</li>
	{/each}
</ol>
