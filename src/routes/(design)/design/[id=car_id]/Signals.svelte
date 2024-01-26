<script lang="ts">
	import Signal from '$lib/components/Signal.svelte'
	import { getSignalsForCar } from '$lib/signals'
	import type { DepotCar } from 'grace-train-lib/data'
	import { flip } from 'svelte/animate'
	import { backOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'

	export let car: DepotCar

	let showHint = false

	$: carSignals = getSignalsForCar(car)
</script>

<div in:fly={{ y: 50, duration: 300, easing: backOut }} class="flex flex-col sm:gap-3">
	{#if showHint}
		<div
			transition:fly={{ y: 50, duration: 200, easing: backOut }}
			class="alert rounded-none border-none bg-neutral px-2 leading-snug sm:rounded-box sm:gap-6 sm:px-6 sm:text-lg"
		>
			<div class="w-6 text-4xl font-black">🚦</div>
			<div>
				<p>
					<strong class="text-primary">railway signals</strong> will appear down here when
					your car meets certain design criteria
				</p>
				<p class="mt-1 text-base-content/70">
					gracing during
					<strong class="text-primary">signalled grace trains</strong>
					will call this car if it matches that train's
					<strong class="text-primary">signal</strong>
				</p>
				<p class="mt-1 text-base-content/70">
					you can call this car in <strong class="text-base-content">any</strong> train by
					using signal keywords or emotes in your grace messages!
				</p>
			</div>
			<button on:click={() => (showHint = false)} class="btn">ok</button>
		</div>
	{/if}
	<div
		class="flex w-full flex-col gap-1 px-2 py-2 sm:flex-row sm:items-center sm:gap-3 sm:px-4"
	>
		<div class="flex items-center gap-3">
			<h3 class="whitespace-nowrap text-xl font-bold text-primary/90">
				<!-- TODO: Create signal icon -->
				🚦 railway signals
			</h3>
			<button on:click={() => (showHint = !showHint)} class="btn btn-circle btn-sm">
				?
			</button>
		</div>
		<div class="flex flex-wrap gap-2 p-2">
			{#each carSignals as signal (signal)}
				<div animate:flip={{ duration: 200 }}><Signal {signal} /></div>
			{/each}
			{#if carSignals.length === 0}
				<div
					class="badge h-8 border-none px-3 text-lg font-bold text-base-content/50 opacity-50 outline-dashed outline-base-content/30"
				>
					none
				</div>
			{/if}
		</div>
	</div>
</div>
