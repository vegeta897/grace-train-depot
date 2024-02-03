<script lang="ts">
	import type { DesignCar } from '$lib/server/schemas/car'
	import { THEMES } from '$lib/themes'
	import { Car, Engine } from 'grace-train-lib/components'
	import Theme from '$lib/components/Theme.svelte'
	import { pluralize } from '$lib/util'

	export let cars: DesignCar[]
</script>

<div class="flex flex-wrap gap-3 lg:gap-x-8 lg:gap-y-6">
	{#each THEMES as theme}
		{@const themeCars = cars
			.filter((car) => car.themes.includes(theme))
			.sort((a, b) => a.themes.length - b.themes.length)}
		<div class="w-72">
			<div class="rounded-t-box overflow-clip bg-base-200 pb-3 pl-6">
				<div class="relative -mr-48 flex h-28 items-end">
					<div class="z-[101] mr-2" style:width="calc(450px / 4.5)">
						<Engine facing="left" />
					</div>
					{#each themeCars.slice(0, 4) as themeCar, c}
						<div
							style:width="calc(375px / 4.5)"
							class:ml-[-50px]={c > 0}
							style:z-index={100 - c}
						>
							<Car car={{ depotCar: themeCar }} />
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
					<Theme {theme} small />
					<strong class="leading-tight"
						>{themeCars.length > 0 ? themeCars.length : 'no'}
						{pluralize(themeCars.length, 'car')}</strong
					>
				</div>
				<a
					href="/design/new?theme={encodeURIComponent(theme)}"
					class="btn btn-outline text-lg">Design</a
				>
			</div>
		</div>
	{/each}
</div>
