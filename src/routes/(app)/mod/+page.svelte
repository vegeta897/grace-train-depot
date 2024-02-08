<script lang="ts">
	import { getRelativeTime } from '$lib/util'
	import type { PageData, SubmitFunction } from './$types'
	import { Car } from 'grace-train-lib/components'
	import Train, { type ModPageTrain, type ModPageTrainCar } from './Train.svelte'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import Icon from '$lib/components/Icon.svelte'
	import { enhance } from '$app/forms'

	export let data: PageData

	let refreshing = false
	let dialog: HTMLDialogElement
	let confirmingHide = false

	$: endedTrains = data.trains.filter((t) => t.ended)
	$: urlTrainId = Number($page.url.searchParams.get('t'))
	$: urlCarIndex = Number($page.url.searchParams.get('i'))
	$: selectedCar =
		!isNaN(urlTrainId) && !isNaN(urlCarIndex)
			? (data.trains
					.find((t) => t.id === urlTrainId)
					?.cars.find((c) => c.index === urlCarIndex) as ModPageTrainCar)
			: null
	$: if (dialog && selectedCar) dialog.showModal()
	$: if (dialog && !selectedCar) dialog.close()

	async function refreshTrain(id: number, afterIndex: number) {
		refreshing = true
		const response = await fetch(`/mod?id=${id}&afterIndex=${afterIndex}`)
		const refreshData = (await response.json()) as {
			ended: boolean
			newCars: ModPageTrain['cars']
		}
		refreshing = false
		const train = data.trains.find((train) => train.id === id)
		if (!train) return
		train.ended = refreshData.ended
		train.cars.unshift(...refreshData.newCars)
		data = data
	}

	const onHideUser: SubmitFunction = () => () => {
		goto('/mod', { replaceState: true, invalidateAll: true })
		confirmingHide = false
	}
</script>

<svelte:head><title>Choo Choo Mod!</title></svelte:head>
<section class="py-4 xs:px-4">
	<div class="flex flex-col gap-4 bg-neutral p-4 xs:rounded-box">
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-black uppercase tracking-wide">🛡️ Mod view</h2>
			<a href="/mod/log" class="btn"><span>📄</span>Audit log</a>
		</div>
		{#if data.trains.length === 0}
			<p class="text-xl">no recent trains that need moderating!</p>
		{/if}
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
				<Train {train} {selectedCar} />
			</div>
		{/if}
		{#if endedTrains.length > 0}
			<h3 class="text-2xl font-black">ended trains</h3>
			<ol class="space-y-4">
				{#each endedTrains as train}
					{@const lastCarTimeRelative = getRelativeTime(new Date(train.cars[0].addedAt))}
					<li class="flex flex-col gap-2">
						<span class="badge badge-lg font-bold" class:badge-primary={!train.ended}>
							{lastCarTimeRelative[0]}
							{lastCarTimeRelative[1]} ago
						</span>
						<Train {train} {selectedCar} />
					</li>
				{/each}
			</ol>
		{/if}
		<p class="my-2 text-base-content/70">
			<strong>note:</strong> only cars with decals are included on this page
		</p>
	</div>
</section>
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- TODO: Use daisyUI dialog classes -->
<dialog
	class="rounded-box bg-neutral shadow-lg shadow-black/40 backdrop:bg-black/40 open:animate-pop open:backdrop:animate-fade focus:outline-none"
	bind:this={dialog}
	on:close={() => {
		goto('/mod', { replaceState: true })
		confirmingHide = false
	}}
	on:click|self={() => dialog.close()}
>
	{#if selectedCar}
		<div class="flex flex-col items-center gap-4 px-8 py-6">
			<div class="overflow-clip p-2"><Car car={selectedCar.carData} /></div>
			<h4 class="flex gap-2 text-2xl font-bold">
				<Icon icon="twitch" class="w-4" />
				{selectedCar.user?.twitchDisplayName}
			</h4>
			<div class="flex gap-8 text-lg">
				{#if selectedCar.car}
					<a class="link" href="/c/{selectedCar.car.shortId}">car page</a>
				{/if}
				{#if selectedCar.user}
					<a class="link" href="/mod/users/{selectedCar.user.id}">user page</a>
				{/if}
			</div>
			{#if !selectedCar.car}
				(this car was deleted)
			{/if}
			{#if selectedCar.user && (selectedCar.user.trustLevel === 'default' || (selectedCar.user.trustLevel === 'trusted' && data.admin))}
				<form
					method="POST"
					use:enhance={onHideUser}
					action="?/hideUser"
					class="flex flex-col gap-4"
				>
					<input name="userId" hidden type="text" value={selectedCar.user?.id} />
					{#if confirmingHide}
						<div class="grid grid-cols-2 gap-3">
							<p class="col-span-2 text-center text-lg font-bold">are you sure?</p>
							<button type="button" on:click={() => (confirmingHide = false)} class="btn">
								Cancel
							</button>
							<button class="btn hover:btn-error">Do it</button>
						</div>
					{:else}
						<button
							type="button"
							on:click={() => (confirmingHide = true)}
							class="btn btn-lg"
						>
							<span>🚫</span> Hide user's cars
						</button>
					{/if}
				</form>
			{:else}
				<div>
					<p class="alert alert-info">
						{#if !selectedCar.user}
							<span>❔</span> this user no longer exists
						{:else if selectedCar.user.trustLevel === 'trusted'}
							<span>🤍</span> this is a trusted user
						{:else}
							<span>🚫</span> this user is already {selectedCar.user.trustLevel}
						{/if}
					</p>
				</div>
			{/if}
			<button on:click={() => dialog.close()} class="btn">Close</button>
		</div>
	{/if}
</dialog>
