<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<section class="rounded-box m-4 flex flex-col gap-2 bg-neutral p-4">
	<h2 class="text-2xl font-black uppercase tracking-wide">🛡️ Mod view</h2>
	<p>these users have recently appeared in grace trains</p>
	{#each data.users as user}
		{@const flagged = user.trustLevel === 'flagged'}
		<div class="space-y-2 rounded-lg bg-base-100 px-3 py-2">
			<a href="/mod/users/{user.id}" class="link text-lg">{user.twitchDisplayName}</a>
			{#if flagged}<span class="badge badge-warning badge-lg ml-2 font-bold">
					flagged
				</span>{/if}
			{#if user.graceTrainCars.length > 0}
				<ol
					class="grid grid-cols-[repeat(auto-fill,_minmax(6rem,_1fr))] gap-3 overflow-clip rounded-lg bg-base-200 p-3"
				>
					{#each user.graceTrainCars as car (`${car.carId}:${car.carRevision}`)}
						<li class="relative flex flex-col items-center justify-end pt-3">
							<Car car={car.carData} />
						</li>
					{/each}
				</ol>
			{:else}
				<span class="ml-2 italic text-base-content/70">no recent cars</span>
			{/if}
		</div>
	{/each}
	{#if data.users.length === 0}
		<p class="my-12 text-center text-lg italic">no users to show</p>
	{/if}
</section>
