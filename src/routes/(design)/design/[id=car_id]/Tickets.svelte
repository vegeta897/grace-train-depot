<script lang="ts">
	import { getTicketsForCar, ticketDefs } from '$lib/tickets'
	import type { DepotCar } from 'grace-train-lib/data'
	import { backOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'

	// TODO: Make a component that just lists tickets
	export let car: DepotCar

	let showHint = false

	$: carTickets = getTicketsForCar(car)
</script>

<div in:fly={{ y: 80, duration: 300, easing: backOut }} class="flex flex-col sm:gap-3">
	{#if showHint}
		<div
			transition:fly={{ y: 32, duration: 200, easing: backOut }}
			class="alert rounded-none border-none bg-neutral px-2 leading-snug sm:rounded-box sm:px-6 sm:text-lg"
		>
			<div class="w-6 text-3xl font-black">?</div>
			<div>
				<p>
					<strong class="text-primary">🎟️ theme tickets</strong> appear down here when your
					car meets certain design criteria!
				</p>
				<p class="mt-1 text-base-content/70">
					during <strong class="text-primary">themed</strong> grace trains, your graces
					will summon cars that have a matching
					<strong class="text-primary">theme ticket</strong>
				</p>
				<p class="mt-1 text-base-content/70">
					you can include theme keywords or emotes in your grace messages to summon them
					in <strong>any</strong> train!
				</p>
			</div>
			<button on:click={() => (showHint = false)} class="btn">ok</button>
		</div>
	{/if}
	<div
		class="flex w-full flex-col gap-1 px-2 py-2 sm:flex-row sm:items-center sm:gap-3 sm:px-4"
	>
		<!-- TODO: Create ticket icon -->
		<div class="flex items-center gap-3">
			<h3 class="whitespace-nowrap text-xl font-bold text-primary/90">
				🎟️ theme tickets
			</h3>
			<button on:click={() => (showHint = !showHint)} class="btn btn-circle btn-sm">
				?
			</button>
		</div>
		<div class="flex flex-wrap gap-2 p-2">
			{#each carTickets as ticketName (ticketName)}
				{@const ticket = ticketDefs[ticketName]}
				<div
					class="badge h-8 border-none px-3 text-lg font-bold"
					style:color={ticket.colors[0]}
					style:background={ticket.colors[1]}
				>
					{ticketName}
				</div>
			{/each}
			{#if carTickets.length === 0}
				<div
					class="badge h-8 border-none px-3 text-lg font-bold text-base-content/50 opacity-50 outline-dashed outline-base-content/30"
				>
					none
				</div>
			{/if}
		</div>
	</div>
</div>
