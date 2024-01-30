<script lang="ts">
	import type { PageData } from './$types'
	import { getDesignStores } from './stores'
	import { browser } from '$app/environment'
	import { Car } from 'grace-train-lib/components'
	import { getCarViewBox } from '$lib/car'
	import { SIGNALS, signalDefs, type SignalName } from '$lib/signals'

	export let data: PageData

	const { localCars, designCar, designShortId } = getDesignStores()

	function toggleSignalGoal(signal: SignalName) {
		localCars.update((cars) => {
			cars[$designShortId].signalGoals = SIGNALS.filter((s) =>
				cars[$designShortId].signalGoals.includes(s) ? s !== signal : s === signal
			)
			return cars
		})
	}
</script>

<!-- TODO: Side by side layout in lg: view, like other design pages -->
<section class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row">
	<div class="flex flex-col items-center lg:w-1/2">
		<div class="p-4 lg:p-6">
			{#if browser}
				<Car car={{ depotCar: $designCar }} viewBox={getCarViewBox($designCar)} />
			{/if}
		</div>
		<h3 class="text-3xl font-black">{$designCar.name}</h3>
	</div>
	<div class="rounded-box flex flex-col bg-neutral p-6 xs:px-10 xs:py-8 lg:w-2/3">
		{#if data.firstCar}
			<p class="text-xl">let's design your first <strong>grace train</strong> car!</p>
			<p>start with the basics:</p>
			<a class="btn btn-lg font-black" href="/design/{$designShortId}/body"
				><span class="relative top-[-3px] text-2xl">🚌</span> Pick a Body</a
			>
		{:else if $designShortId !== 'new'}
			<!-- TODO: Suggest a page based on existing design -->
			<p class="text-xl">how about a new set of wheels?</p>
			<a class="btn btn-lg" href="/design/{$designShortId}/wheels"
				><span class="relative text-2xl">🎡</span> Wheels</a
			>
		{/if}
		{#if !data.firstCar}
			<p class="text-lg">
				choose the <strong class="text-primary">railway signals</strong> you want to design
				for
			</p>
			<p class="text-base text-base-content/50">optional</p>
			<div class="mt-4 grid grid-cols-2 gap-4 xs:grid-cols-3">
				{#each SIGNALS as signal}
					{@const { colors } = signalDefs[signal]}
					{@const inGoals = $designCar.signalGoals.includes(signal)}
					<button
						on:click={() => toggleSignalGoal(signal)}
						class="btn btn-block h-10 min-h-10 rounded-full border-[3px] px-3 text-lg font-bold lowercase"
						style:color={colors[0]}
						style:background={inGoals ? colors[1] : 'transparent'}
						style:border-color={colors[1]}
						class:opacity-75={!inGoals}
						class:saturate-50={!inGoals}
						aria-checked={inGoals}
						role="checkbox"
					>
						{signal}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</section>
