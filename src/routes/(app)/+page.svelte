<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { COLORS } from 'grace-train-lib'
	import CarGrid from './CarGrid.svelte'
	import { getSideFadeGradient } from '$lib/util'
	import Icon from '$lib/components/Icon.svelte'
	import { browser } from '$app/environment'
	import ThemeShowcase from './ThemeShowcase.svelte'

	export let data: PageData

	$: cars = data.savedCars || []

	const carDeleted = $page.url.searchParams.get('carDeleted')
	const sideFadeGradient = getSideFadeGradient(20)

	let showThemesInfo = false
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
{#if data.user}
	<section class="flex flex-col items-stretch gap-4 p-4 md:p-8">
		{#if carDeleted}
			<div class="alert alert-info w-auto">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				Car deleted
			</div>
		{/if}
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h2 class="flex items-end gap-2 text-lg font-bold">
				<Icon icon="twitch" class="size-6" />
				{data.user.twitchDisplayName}
			</h2>
			{#if data.user.isMod}
				<a href="/mod" class="btn">🛡️ Mod view</a>
			{/if}
		</div>
		<!-- TODO: Car grid doesn't look great before hydration -->
		<CarGrid {cars} />
		<div class="flex items-center gap-3">
			<h2 class="text-2xl font-bold">🚦 themes</h2>
			<button
				on:click={() => (showThemesInfo = !showThemesInfo)}
				class="btn btn-circle btn-sm size-10 text-lg"
				class:btn-primary={showThemesInfo}
			>
				?
			</button>
		</div>
		{#if showThemesInfo}
			<div
				class="alert rounded-none border-none bg-neutral px-2 leading-snug sm:rounded-box sm:gap-6 sm:px-6 sm:text-lg"
			>
				<div class="w-6 text-4xl font-black">🚦</div>
				<div>
					<p>
						every car you create is automatically tagged with
						<strong class="text-primary">themes</strong> based on its design
					</p>
					<p class="mt-1">
						gracing during
						<strong class="text-primary">themed grace trains</strong>
						will call any cars that match that train's theme
					</p>
					<p class="mt-1">
						you can prepare for any train by designing one or more cars for each theme!
					</p>
				</div>
				<button on:click={() => (showThemesInfo = false)} class="btn">ok</button>
			</div>
		{/if}
		{#if browser}
			<ThemeShowcase {cars} />
		{:else}
			<div class="text-center">
				<span class="loading loading-dots loading-lg text-primary"></span>
			</div>
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
