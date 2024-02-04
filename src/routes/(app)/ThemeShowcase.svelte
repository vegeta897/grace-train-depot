<script lang="ts">
	import type { DesignCar } from '$lib/server/schemas/car'
	import { THEMES } from '$lib/themes'
	import { Car, Engine } from 'grace-train-lib/components'
	import Theme from '$lib/components/Theme.svelte'
	import { pluralize } from '$lib/util'
	import { browser } from '$app/environment'

	export let cars: DesignCar[]
</script>

<div class="grid grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))] gap-4 sm:gap-6">
	{#each THEMES as theme}
		{@const themeCars = cars
			.filter((car) => car.themes.includes(theme))
			.sort((a, b) => a.themes.length - b.themes.length)}
		<div class="w-full">
			<div class="rounded-t-box h-[7.75rem] overflow-clip bg-base-200">
				{#if browser}
					<div class="relative flex h-[7.75rem] items-end justify-center pb-3 pl-4">
						<div class="z-[101] mr-2 shrink-0" style:width="calc(450px / 4.5)">
							<Engine facing="left" />
						</div>
						{#if themeCars.length > 0}
							{#each themeCars.slice(0, 5) as themeCar, c}
								<div
									class="shrink-0"
									style:width="calc(375px / 4.5)"
									class:ml-[calc(-50px_+_min(calc(40%_-_110px),_0px))]={c > 0}
									style:z-index={100 - c}
								>
									<Car car={{ depotCar: themeCar }} />
									{#if c > 0}
										<div
											class="absolute left-0 top-0 h-32 w-full bg-base-200 opacity-50"
										/>
									{/if}
								</div>
							{/each}
						{:else}
							TODO: Empty car
						{/if}
					</div>
				{:else}
					<div class="flex h-full items-center justify-center">
						<span class="loading loading-dots loading-lg animate-fade-in text-primary"
						></span>
					</div>
				{/if}
			</div>
			<div
				class="rounded-b-box flex items-center justify-around bg-neutral px-4 py-2 pl-1"
			>
				<div class="flex max-w-48 grow flex-col items-center gap-1">
					<Theme {theme} small />
					<strong class="leading-tight"
						>{themeCars.length > 0 ? themeCars.length : 'no'}
						{pluralize(themeCars.length, 'car')}</strong
					>
				</div>
				<a
					href="/design/new?theme={encodeURIComponent(theme)}"
					class="btn btn-outline text-lg">New</a
				>
			</div>
		</div>
	{/each}
</div>
