<script lang="ts">
	import { Car, ContainerSvg, Decal, decalDefs } from 'grace-train-lib/components'
	import type { PageData } from './$types'
	import { COLORS } from 'grace-train-lib'
	import CarGrid from './CarGrid.svelte'
	import { getSideFadeGradient } from '$lib/util'
	import ThemeGrid from './ThemeGrid.svelte'
	import LatestCars from './LatestCars.svelte'
	import type { DecalName } from 'grace-train-lib/data'

	export let data: PageData

	const sideFadeGradient = getSideFadeGradient(20)

	const shapes: DecalName[] = ['circle', 'star', 'heart', 'box']
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
			{@const moreCars = data.cars.length > 2}
			<!-- <h2 class="text-4xl font-black">your cars</h2> -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
				{#each data.cars.slice(0, moreCars ? 1 : 2) as car}
					<a
						href="/c/{car.shortId}"
						class="rounded-box overflow-clip bg-base-200 transition-transform hover:scale-105"
					>
						<div class="px-[20%] pt-[25%]">
							<Car car={{ depotCar: car }} />
						</div>
						<h2 class="px-6 py-4 text-center text-xl font-bold">
							{car.name}
						</h2>
					</a>
				{/each}
				{#if oneCar}
					<div
						class="rounded-box flex flex-col gap-4 bg-neutral px-8 py-6 text-lg font-bold"
					>
						<p>you could start GRACE-ing now and see your car...</p>
						<div class="-mx-4 rounded-lg bg-base-200 px-3 py-1 text-base font-normal">
							<strong class="text-primary">{data.user.twitchDisplayName}</strong>: GRACE
						</div>
						<p>but you should really design more cars!</p>
						<p class="mt-auto text-base-content/80">
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
				<div
					class="rounded-box flex flex-col items-center justify-between gap-4 bg-neutral px-8 py-6"
				>
					<p class="text-2xl font-bold">design more cars!</p>
					<div class="grid w-1/2 grid-cols-2">
						{#each shapes as decal}
							<ContainerSvg viewBox="-60 -60 120 120">
								<Decal
									name={decal}
									fill="#fff"
									params={decalDefs[decal].getDefaultParamsObject()}
								/>
							</ContainerSvg>
						{/each}
					</div>
					<a href="/design/new" class="btn btn-primary btn-lg btn-block">Design</a>
				</div>
				<div
					class="rounded-box flex flex-col items-center justify-between gap-4 bg-neutral px-8 py-6"
				>
					<p class="text-xl font-bold">hey, finish your themes!</p>
				</div>
			</div>
			<LatestCars cars={data.cars} count={data.carCount} />
			<p>This car grid sucks too!</p>
			<p>Be less afraid of whitespace</p>
			<p>Maybe make a modal for showing all cars (with same faded vertical scrolling)</p>
			<CarGrid cars={data.cars} />
			<ThemeGrid cars={data.cars} />
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
