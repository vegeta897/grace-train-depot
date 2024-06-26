<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'
	import { COLORS } from 'grace-train-lib'
	import CarGrid from './CarGrid.svelte'
	import { getSideFadeGradient, pluralize } from '$lib/util'
	import ThemeGrid from './ThemeGrid.svelte'
	import LatestCars from './LatestCars.svelte'
	import { THEMES, themeDefs } from '$lib/themes'
	import { fade, fly } from 'svelte/transition'
	import { backIn, backOut } from 'svelte/easing'

	export let data: PageData

	const sideFadeGradient = getSideFadeGradient(20)

	let showThemeInfo = false
	let chooSquared = false
</script>

<svelte:head>
	<meta property="og:title" content="Choo Choo!" />
	<meta property="og:image" content="/apple-touch-icon.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="twitter:title" content="Choo Choo!" />
	<meta property="twitter:image" content="/apple-touch-icon.png" />
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:description" content="Customize your Grace Train car" />
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>
<!-- TODO: Separate logged in and logged out views into components -->
{#if data.user}
	<section class="flex flex-col items-stretch gap-4 p-4 md:p-8">
		<!-- <div class="flex flex-wrap items-center justify-between gap-2">
			<h2 class="flex items-end gap-2 text-lg font-bold">
				<Icon icon="twitch" class="size-6" />
				{data.user.twitchDisplayName}
			</h2>
			{#if data.user.isMod}
				<a href="/mod" class="btn">🛡️ Mod view</a>
			{/if}
		</div> -->
		{#if data.cars}
			{@const oneCar = data.cars.length === 1}
			{@const moreCars = data.cars.length > 1}
			<!-- <h2 class="text-4xl font-black">your cars</h2> -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
				<a
					href="/c/{data.cars[0].shortId}"
					class="rounded-box flex flex-col justify-center overflow-clip bg-base-200 transition-transform hover:scale-105"
				>
					<div class="px-[20%] pt-[25%]">
						<Car car={{ depotCar: data.cars[0] }} />
					</div>
					<h2 class="p-6 text-center text-xl font-bold">
						{data.cars[0].name}
					</h2>
				</a>
				{#if oneCar}
					<div
						class="rounded-box flex flex-col justify-center gap-4 bg-neutral px-8 py-6 text-lg font-bold"
					>
						<p>you could start GRACE-ing now and see your car...</p>
						<div class="-mx-4 rounded-lg bg-base-200 px-3 py-1 text-base font-normal">
							<strong class="text-primary">{data.user.twitchDisplayName}</strong>: GRACE
						</div>
						<p>but you should really design more cars!</p>
						<p class="text-base-content/80">
							remember:<br />
							<span class="text-secondary">more variety = cooler trains</span>
						</p>
					</div>
				{:else if moreCars}
					<div class="rounded-box relative min-h-[12rem] bg-base-200">
						<div class="absolute flex h-full items-center overflow-clip opacity-40">
							<figure class="grid grid-cols-2 p-8 sm:pt-2">
								{#each data.cars.slice(-4) as car}
									<div class="px-[10%] pt-[30%]">
										<Car car={{ depotCar: car }} />
									</div>
								{/each}
							</figure>
						</div>
						<div class="flex h-full flex-col justify-center px-8 py-6 sm:justify-end">
							<a
								class="glass-bg btn btn-neutral btn-lg btn-block whitespace-nowrap"
								href="/cars">View your cars</a
							>
						</div>
					</div>
				{/if}
				<div class="hidden flex-col items-center justify-center p-8 sm:max-lg:flex">
					<button
						on:click={() => (chooSquared = !chooSquared)}
						class="grid w-52 grid-cols-1 text-left text-6xl font-black leading-none text-base-content/20 transition-transform hover:scale-105"
					>
						{#if chooSquared}
							<div
								in:fade={{ duration: 50, delay: 250 }}
								out:fade={{ duration: 50 }}
								class="col-start-1 row-start-1 flex h-32 items-center"
							>
								CHOO<sup>2</sup>!
							</div>
						{:else}
							<div class="col-start-1 row-start-1 h-32">
								<div
									out:fly={{ y: 50, easing: backIn, duration: 300 }}
									in:fly={{ y: 50, easing: backOut, duration: 200 }}
								>
									CHOO
								</div>
								<div
									out:fly={{ y: -50, easing: backIn, duration: 300 }}
									in:fly={{ y: -50, easing: backOut, duration: 200 }}
								>
									CHOO!
								</div>
							</div>
						{/if}
					</button>
				</div>
				<div
					class="rounded-box flex flex-col items-center gap-4 self-end bg-neutral px-8 py-6"
				>
					<div>
						<p class="text-2xl font-bold">
							you have
							<span class="font-black text-primary">{data.carCount}</span>
							{pluralize(data.carCount, 'car')}!<br />
						</p>
						<p class="text-lg text-base-content/70">
							but you could have {data.carCount + 1}
						</p>
					</div>
					<!-- <CarTally carCount={data.carCount} /> -->
					<a href="/design/new" class="btn btn-primary btn-lg btn-block">Design a car</a>
				</div>
				<div
					class="rounded-box col-span-full flex flex-col justify-between gap-6 bg-neutral px-8 py-6"
				>
					<div class="flex items-baseline gap-4">
						<h2 class="text-2xl font-bold">🚦 themes</h2>
						<span class="text-base-content/70"
							>{Object.keys(data.themeCarCount).length} of {THEMES.length}</span
						>
						<button
							on:click={() => (showThemeInfo = !showThemeInfo)}
							class="btn btn-circle ml-auto text-xl"
							class:btn-primary={showThemeInfo}
						>
							?
						</button>
					</div>
					<!-- TODO: Links go to design page if no cars, or cars page with filter applied if have
					cars -->
					{#if showThemeInfo}
						<ul class="-mt-4 list-disc px-8 text-lg leading-snug">
							<li>
								every car you create is automatically tagged with
								<strong class="text-primary">themes</strong> based on its design
							</li>
							<li class="mt-2">
								gracing during
								<strong class="text-primary">themed grace trains</strong>
								will call any cars that match that train's theme
							</li>
							<li class="mt-2">
								you can prepare for any train by designing one or more cars for each
								theme!
							</li>
						</ul>
					{/if}
					<div
						class="grid grid-cols-[repeat(auto-fill,_minmax(16rem,_1fr))] gap-3 sm:gap-4"
					>
						{#each THEMES as theme}
							{@const { colors } = themeDefs[theme]}
							{@const carCount = data.themeCarCount[theme] || 0}
							<a
								href="/{carCount > 0 ? 'cars' : 'design/new'}?theme={encodeURIComponent(
									theme
								)}"
								class="rounded-box flex items-baseline justify-between gap-4 bg-neutral px-5 py-3 text-lg font-bold outline-offset-[-6px] transition-transform hover:scale-105"
								style:background-color={colors[1]}
								style:outline-color={colors[1]}
								class:outline={carCount === 0}
								class:outline-[6px]={carCount === 0}
								class:!bg-transparent={carCount === 0}
							>
								<h3 style:color={colors[0]}>{theme}</h3>
								<span>{carCount} {pluralize(carCount, 'car')}</span>
							</a>
						{/each}
					</div>
				</div>
			</div>
			<!-- <LatestCars cars={data.cars} count={data.carCount} />
			<p>This car grid sucks too!</p>
			<p>Be less afraid of whitespace</p>
			<p>Maybe make a modal for showing all cars (with same faded vertical scrolling)</p>
			<CarGrid cars={data.cars} />
			<ThemeGrid cars={data.cars} /> -->
		{/if}
	</section>
{:else}
	<section class="flex grow flex-col items-center justify-center p-4 md:p-8">
		<div class="hero rounded-box max-w-3xl bg-base-200 pb-4 sm:py-8">
			<div class="hero-content min-w-0 max-w-full flex-col px-6">
				<div
					class="relative flex min-w-0 max-w-full overflow-clip py-8 sm:py-16"
					style:-webkit-mask={sideFadeGradient}
					style:mask={sideFadeGradient}
				>
					<div class="origin-left scale-125 sm:scale-200">
						<!-- TODO: Animate each car instead of whole container! -->
						<div style:left="-4rem" class="train-scroll relative whitespace-nowrap">
							{#each Array(14) as _, i}
								<div class="mx-[3px] inline-block w-16">
									<Car car={{ color: COLORS.POP[(i * 3) % COLORS.POP.length] }} />
								</div>
							{/each}
						</div>
					</div>
				</div>
				<div
					class="flex flex-col items-stretch gap-2 px-4 sm:flex-row sm:items-center sm:gap-12 lg:gap-16"
				>
					<div class="flex max-w-lg flex-col items-start">
						<h1
							class="whitespace-nowrap pb-1 text-4xl font-black uppercase tracking-wide xs:pb-2 xs:text-5xl"
						>
							Choo Choo!
						</h1>
						<p class="py-2 text-xl">all aboard the Grace Train!</p>
						<p class="py-2 text-lg">design your own cars and see them on stream!</p>
					</div>
					<div class="flex max-w-lg flex-col items-center">
						<a href="/login" data-sveltekit-reload class="btn btn-secondary btn-lg mb-4"
							>Twitch Login</a
						>
						<a href="/design/new" class="link opacity-70 hover:opacity-100"
							>just start designing</a
						>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	.train-scroll {
		animation: scroll 16s linear infinite;
		will-change: transform;
	}
	@keyframes scroll {
		100% {
			transform: translateX(calc(calc(64px + 6px) * -8));
		}
	}
</style>
