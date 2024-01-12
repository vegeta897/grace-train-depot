<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { COLORS } from 'grace-train-lib'
	import CarGrid from './CarGrid.svelte'
	import { getSideFadeGradient } from '$lib/util'
	import Icon from '$lib/components/Icon.svelte'

	export let data: PageData

	$: publishedCars = data.savedCars?.filter((c) => c.published) || []
	$: draftCars = data.savedCars?.filter((c) => !c.published) || []

	const carDeleted = $page.url.searchParams.get('carDeleted')

	const sideFadeGradient = getSideFadeGradient(20)
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
	<!-- TODO: Move this to a /me or /depot route? -->
	<section class="flex flex-col items-center gap-4 p-4 md:p-8">
		{#if carDeleted}
			<div class="alert alert-info w-auto">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
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
		<div class="rounded-box flex w-full flex-col gap-4 bg-neutral p-4 md:px-10 md:py-8">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h2 class="flex items-end gap-2 text-lg font-bold">
					<Icon icon="twitch" class="h-6 w-6" />
					{data.user.twitchDisplayName}
				</h2>
				{#if data.user.isMod}
					<a href="/mod" class="btn">🛡️ Mod view</a>
				{/if}
			</div>
			<CarGrid cars={publishedCars} />
			{#if draftCars.length > 0}
				<CarGrid title="my drafts" cars={draftCars} />
			{/if}
		</div>
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
