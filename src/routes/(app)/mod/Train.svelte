<script lang="ts" context="module">
	import type { $Enums } from '@prisma/client'
	import { Car } from 'grace-train-lib/components'
	import type { GraceTrainCar } from 'grace-train-lib/trains'

	export type ModPageTrain = {
		id: number
		ended: boolean
		cars: {
			index: number
			addedAt: Date
			carData: GraceTrainCar
			user: {
				twitchUsername: string
				twitchDisplayName: string
				id: string
				trustLevel: $Enums.TrustLevel
			} | null
			car: { shortId: string } | null
			hidden: boolean
		}[]
	}
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
				class="flex w-[7.5rem] shrink-0 flex-col items-center gap-1 overflow-clip rounded-md px-2 pb-1 pt-3 transition-all"
				class:bg-neutral={car === selectedCar}
				class:outline={car === selectedCar}
			>
				<Car car={car.carData} />
				<div
					class="overflow-hidden text-wrap break-words text-center text-sm leading-none text-base-content/90"
				>
					{car.user?.twitchDisplayName || 'deleted user'}
				</div>
			</a>
		</li>
	{/each}
</ol>
