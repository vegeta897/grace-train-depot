<script lang="ts">
	import type { PageData } from './$types'
	import { getDesignStores } from './stores'
	import { browser } from '$app/environment'
	import { Car } from 'grace-train-lib/components'
	import { getCarViewBox } from '$lib/car'
	import { SIGNALS, type SignalName } from '$lib/signals'
	import Signal from '$lib/components/Signal.svelte'

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
	<div class="rounded-box flex flex-col gap-4 bg-neutral p-6 sm:px-10 sm:py-8 lg:w-2/3">
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
				choose the <strong class="text-primary">themes</strong> you want to design for
				<br />
				<span class="text-base text-base-content/50">optional</span>
			</p>
			<div class="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2 sm:gap-x-5">
				{#each SIGNALS as signal}
					{@const inGoals = $designCar.signalGoals.includes(signal)}
					{@const notDesigned = data.missingThemes?.includes(signal)}
					<label
						class="flex cursor-pointer items-center justify-between gap-3 rounded-full bg-base-100 p-3"
					>
						<div class="indicator">
							{#if notDesigned}
								<span
									class="badge indicator-item badge-primary badge-xs indicator-start left-1 top-1 border-base-content bg-base-content"
								/>
							{/if}
							<Signal {signal} />
						</div>
						<input
							type="checkbox"
							class="toggle toggle-lg"
							checked={inGoals}
							on:change={() => toggleSignalGoal(signal)}
						/>
					</label>
				{/each}
			</div>
			<p>
				<span
					class="badge badge-primary badge-xs mr-2 border-base-content bg-base-content"
				/>themes you haven't designed any cars for
			</p>
		{/if}
	</div>
</section>
