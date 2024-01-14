<script lang="ts">
	import { getRelativeTime } from '$lib/util'
	import type { PageData } from './$types'
	import { Car } from 'grace-train-lib/components'
	import Train, { type ModPageTrain, type ModPageTrainCar } from './Train.svelte'

	export let data: PageData

	let refreshing = false
	let selectedCar: ModPageTrainCar | null = null
	let dialog: HTMLDialogElement

	$: if (dialog && selectedCar) dialog.showModal()
	$: if (dialog && !selectedCar) dialog.close()

	async function refreshTrain(id: number, afterIndex: number) {
		refreshing = true
		const response = await fetch(`/api/train/${id}?afterIndex=${afterIndex}`)
		const refreshData = (await response.json()) as {
			ended: boolean
			newCars: ModPageTrain['cars']
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
			<div class="flex flex-col gap-2">
				<h3 class="text-2xl font-black">current train</h3>
				<button
					on:click={() => refreshTrain(train.id, train.cars[0].index)}
					disabled={refreshing}
					class="btn btn-primary btn-sm w-32"
					>{refreshing ? 'refreshing...' : 'refresh'}</button
				>
				<Train {train} bind:selectedCar />
			</div>
		{/if}
		<h3 class="text-2xl font-black">ended trains</h3>
		<ol class="space-y-4">
			{#each data.trains.filter((t) => t.ended) as train}
				{@const lastCarTimeRelative = getRelativeTime(train.cars[0].addedAt)}
				<li class="flex flex-col gap-2">
					<span class="badge badge-lg font-bold" class:badge-primary={!train.ended}>
						{lastCarTimeRelative[0]}
						{lastCarTimeRelative[1]} ago
					</span>
					<Train {train} bind:selectedCar />
				</li>
			{/each}
		</ol>
		<p><strong>note:</strong> these trains do not include generic cars</p>
	</div>
</section>
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog
	class="rounded-box bg-neutral backdrop:bg-black/40 focus:outline-none"
	bind:this={dialog}
	on:close={() => (selectedCar = null)}
	on:click|self={() => dialog.close()}
>
	{#if selectedCar}
		<div class=" flex flex-col items-center gap-4 px-6 py-4">
			<Car car={selectedCar.carData} />
			<h4 class="text-xl font-bold">{selectedCar.user?.twitchDisplayName}</h4>
			<button class="btn h-16 hover:btn-error">Block user's cars</button>
		</div>
	{/if}
</dialog>
