<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { COLORS } from 'grace-train-lib'
	import CarGrid from './CarGrid.svelte'
	import { getSideFadeGradient } from '$lib/util'

	export let data: PageData

	$: publishedCars = data.savedCars?.filter((c) => c.published) || []
	$: draftCars = data.savedCars?.filter((c) => !c.published) || []

	const carDeleted = $page.url.searchParams.get('carDeleted')

	const sideFadeGradient = getSideFadeGradient(20)
</script>

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
		<div
			class="flex w-full max-w-lg flex-col gap-4 rounded-2xl bg-neutral p-6 sm:max-w-full md:p-10"
		>
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold">
					hey {data.user.twitchDisplayName}!
				</h2>
				{#if data.user.isMod}
					<a href="/mod" class="btn font-black tracking-wide">🛡️ Mod view</a>
				{/if}
			</div>
			<CarGrid cars={publishedCars} />
			{#if draftCars.length > 0}
				<div class="rounded-xl bg-base-200 p-4">
					<h2 class="text-3xl font-black uppercase tracking-wide">Your drafts</h2>
					<CarGrid cars={draftCars} />
				</div>
			{/if}
		</div>
	</section>
{:else}
	<section class="flex h-[75vh] flex-col items-center justify-center p-4 md:p-8">
		<div class="hero max-w-3xl rounded-2xl bg-base-200 pb-4 sm:py-8">
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
									<Car car={COLORS.POP[i % COLORS.POP.length]} />
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
						<a
							href="/login"
							data-sveltekit-reload
							class="btn btn-secondary btn-lg mb-4 font-black tracking-wide"
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
