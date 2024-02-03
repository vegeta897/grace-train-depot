<script lang="ts">
	import type { DesignCar } from '$lib/server/schemas/car'
	import { themeDefs } from '$lib/themes'
	import { flip } from 'svelte/animate'
	import { backOut } from 'svelte/easing'
	import { fly } from 'svelte/transition'
	import SignalProgress from './SignalProgress.svelte'

	export let car: DesignCar

	let showInfo = false

	$: signalGoals = car.themeGoals
</script>

<div
	transition:fly={{ y: 50, duration: 300, easing: backOut }}
	class="flex flex-col p-2 sm:gap-3"
>
	{#if showInfo}
		<div
			transition:fly={{ y: 50, duration: 200, easing: backOut }}
			class="alert rounded-none border-none bg-neutral px-2 leading-snug sm:rounded-box sm:gap-6 sm:px-6 sm:text-lg"
		>
			<div class="w-6 text-4xl">🚦</div>
			<div>
				<p>
					<strong class="text-primary">themes</strong> will appear down here when your car
					meets certain design criteria
				</p>
				<p class="mt-2">
					gracing during
					<strong class="text-primary">themed grace trains</strong>
					will call any of your cars that match that train's theme
				</p>
			</div>
			<button on:click={() => (showInfo = false)} class="btn">ok</button>
		</div>
	{/if}
	<div
		class="flex w-full flex-col items-stretch gap-2 rounded-3xl bg-neutral px-2 py-2 sm:flex-row sm:items-center sm:gap-6 sm:px-4 sm:py-3"
	>
		<!-- <div class="flex items-center gap-3"> -->
		<h3
			class="flex items-center justify-center gap-2 text-center text-xl font-bold text-primary/90"
		>
			<!-- TODO: Create theme icon -->
			<span class="text-3xl">🚦</span><span class="leading-tight sm:w-min"
				>theme goals</span
			>
		</h3>
		<!-- <button
				on:click={() => (showInfo = !showInfo)}
				class="btn btn-circle btn-sm size-10 text-lg"
			>
				?
			</button> -->
		<!-- </div> -->
		<div
			class="grid grow grid-cols-[repeat(auto-fill,_minmax(var(--goal-width),_1fr))] gap-2 [--goal-width:6rem] xs:gap-4 xs:[--goal-width:8rem]"
		>
			{#each signalGoals as goal (goal)}
				{@const { colors, getProgress } = themeDefs[goal]}
				{@const progress = getProgress(car)}
				<div
					class="flex w-full flex-col items-center gap-1 rounded-full pb-2 pt-1 text-lg font-bold leading-tight transition-[opacity,_filter] duration-300"
					style:color={colors[0]}
					class:opacity-50={progress >= 1}
					class:saturate-50={progress >= 1}
					class:delay-200={progress >= 1}
					style:background={colors[1]}
					animate:flip={{ duration: 200 }}
				>
					{goal}
					<!-- <progress class="progress w-2/3" value={progress} /> -->
					<div class="w-2/3">
						<SignalProgress color={colors[0]} {progress} />
					</div>
				</div>

				<!-- TODO: Make a custom svg for this. Solid circle when 100%. Animated -->
				<!-- Don't forget role="progressbar" -->
				<!-- <div class="flex items-center gap-3">
					<div
						class="radial-progress border-4 font-bold"
						style="--value:{progress * 100}; --size:3rem"
						style:background-color={colors[1]}
						style:border-color={colors[1]}
						style:color={colors[0]}
						role="progressbar"
					>
						{#if progress >= 1}
							<span class="text-2xl">✔</span>
						{:else}
							<span>{Math.round(progress * 100)}<span class="text-xs">%</span></span>
						{/if}
					</div>
					<div>
						{goal}
					</div></div> -->
			{/each}
		</div>
		<!-- <div class="flex flex-wrap items-center gap-2 p-2">
			{#each carSignals as signal (signal)}
				<div animate:flip={{ duration: 200 }}><Signal {signal} /></div>
			{/each}
			{#if carSignals.length === 0}
				<div
					class="badge h-8 border-none px-3 text-lg font-bold text-base-content/50 opacity-50 outline-dashed -outline-offset-2 outline-base-content/30"
				>
					none
				</div>
			{/if}
		</div> -->
	</div>
</div>
