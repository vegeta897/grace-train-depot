<script lang="ts">
	import type { DesignCar } from '$lib/server/schemas/car'
	import { SIGNALS } from '$lib/signals'
	import { Car, Engine } from 'grace-train-lib/components'
	import Signal from '$lib/components/Signal.svelte'
	import { pluralize } from '$lib/util'

	export let cars: DesignCar[]
</script>

<div class="flex flex-wrap gap-3 lg:gap-x-8 lg:gap-y-6">
	{#each SIGNALS as signal}
		{@const signalCars = cars
			.filter((car) => car.signals.includes(signal))
			.sort((a, b) => a.signals.length - b.signals.length)}
		<div class="w-72">
			<div class="rounded-t-box overflow-clip bg-base-200 pb-3 pl-6">
				<div class="relative -mr-48 flex h-28 items-end">
					<div class="z-[101] mr-2" style:width="calc(450px / 4.5)">
						<Engine facing="left" />
					</div>
					{#each signalCars.slice(0, 4) as signalCar, c}
						<div
							style:width="calc(375px / 4.5)"
							class:ml-[-50px]={c > 0}
							style:z-index={100 - c}
						>
							<Car car={{ depotCar: signalCar }} />
							<div
								class="absolute left-0 top-0 h-32 w-72 bg-base-200"
								style:opacity={Math.sign(c) / (c + 1)}
							/>
						</div>
					{/each}
				</div>
			</div>
			<div
				class="rounded-b-box flex items-center justify-between bg-neutral px-4 py-2 pl-1"
			>
				<div class="flex grow flex-col items-center gap-1">
					<Signal {signal} small />
					<strong class="leading-tight"
						>{signalCars.length > 0 ? signalCars.length : 'no'}
						{pluralize(signalCars.length, 'car')}</strong
					>
				</div>
				<a
					href="/design/new?theme={encodeURIComponent(signal)}"
					class="btn btn-outline text-lg">Design</a
				>
			</div>
		</div>
	{/each}
</div>
