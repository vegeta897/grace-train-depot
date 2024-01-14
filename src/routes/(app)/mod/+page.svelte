<script lang="ts">
	import { getRelativeTime } from '$lib/util'
	import type { PageData } from './$types'
	import Train from './Train.svelte'

	export let data: PageData

	let refreshing = false

	async function refreshTrain(id: number, afterIndex: number) {
		refreshing = true
		const response = await fetch(`/api/train/${id}?afterIndex=${afterIndex}`)
		const refreshData = (await response.json()) as {
			ended: boolean
			newCars: PageData['trains'][number]['cars']
		}
		refreshing = false
		const train = data.trains.find((train) => train.id === id)
		if (!train) return
		train.ended = refreshData.ended
		train.cars.unshift(
			...refreshData.newCars.map((car) => ({ ...car, addedAt: new Date(car.addedAt) }))
		)
		data = data
	}
</script>

<section class="p-4">
	<div class="rounded-box flex flex-col gap-4 bg-neutral p-4">
		<h2 class="text-2xl font-black uppercase tracking-wide">🛡️ Mod view</h2>
		{#if data.trains[0] && !data.trains[0].ended}
			{@const train = data.trains[0]}
			<div>
				<h3 class="mb-1 text-2xl font-black">current train</h3>
				<button
					on:click={() => refreshTrain(train.id, train.cars[0].index)}
					disabled={refreshing}
					class="btn btn-primary btn-sm w-32"
					>{refreshing ? 'refreshing...' : 'refresh'}</button
				>
			</div>
			<Train {train} />
		{/if}
		<h3 class="text-2xl font-black">ended trains</h3>
		<ol class="space-y-4">
			{#each data.trains.filter((t) => t.ended) as train}
				{@const lastCarTimeRelative = getRelativeTime(train.cars[0].addedAt)}
				<li>
					<span class="badge badge-lg mb-2 font-bold" class:badge-primary={!train.ended}>
						{lastCarTimeRelative[0]}
						{lastCarTimeRelative[1]} ago
					</span>
					<Train {train} />
				</li>
			{/each}
		</ol>
		<p><strong>note:</strong> trains do not include generic cars</p>
	</div>
</section>
