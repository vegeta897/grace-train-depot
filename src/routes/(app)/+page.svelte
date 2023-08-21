<script lang="ts">
	import Car from '$lib/components/Car.svelte'
	import { Body } from 'grace-train-lib'
	import type { PageData } from './$types'
	import { POP_COLORS } from '$lib/common/constants'
	import { page } from '$app/stores'

	export let data: PageData

	const carDeleted = $page.url.searchParams.get('carDeleted')
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
		<div class="w-full max-w-lg rounded-2xl bg-neutral p-6 sm:max-w-full md:p-10">
			<h2 class="mb-4 text-xl">Hello, {data.user.twitchDisplayName}!</h2>
			<div class="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
				<div class="tooltip tooltip-success tooltip-bottom" data-tip="Make a new car">
					<a
						href="/design/new"
						data-sveltekit-preload-data="tap"
						class="nunito btn btn-outline btn-block h-[8.75rem] text-8xl">+</a
					>
				</div>
				<!-- TODO: Maybe separate live cars vs drafts -->
				{#each data.savedCars as car}
					<div class="indicator w-full">
						<span
							class="nunito indicator-center indicator-bottom badge indicator-item uppercase"
							class:badge-primary={car.published}
							class:badge-warning={!car.published}
						>
							{#if car.published}Live{:else}Draft{/if}
						</span>
						<a
							href="/c/{car.shortId}"
							data-sveltekit-preload-data="tap"
							class="nunito btn-hover-grow btn btn-block h-[8.75rem] text-xl"
						>
							<div class="flex flex-col items-center gap-1 normal-case">
								<div class="w-24"><Car {car} /></div>
								{#if car.name}
									{car.name}
								{/if}
							</div>
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>
{:else}
	<section class="flex h-[75vh] flex-col items-center justify-center p-4 md:p-8">
		<div class="hero max-w-3xl rounded-2xl bg-base-200 pb-4 sm:py-8">
			<div class="hero-content min-w-0 max-w-full flex-col px-6">
				<div
					class="relative flex min-w-0 max-w-full overflow-clip py-8 sm:py-16"
					style="--fade-sides: linear-gradient(90deg, rgba(0,0,0,0) 0, rgba(0,0,0,1) 20% 80%, rgba(0,0,0,0) 100%)"
					style:-webkit-mask="var(--fade-sides)"
					style:mask="var(--fade-sides)"
				>
					<div class="origin-left scale-125 sm:scale-200">
						<div style:left="-4rem" class="train-scroll relative whitespace-nowrap">
							{#each Array(12) as _, i}
								<div class="mx-[4px] inline-block w-16">
									<Body color={POP_COLORS[i % POP_COLORS.length]} name="boxy" />
								</div>
							{/each}
						</div>
					</div>
				</div>
				<div
					class="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-16"
				>
					<div class="flex max-w-lg flex-col items-start">
						<h1
							class="nunito whitespace-nowrap pb-1 text-4xl uppercase xs:pb-2 xs:text-5xl"
						>
							Choo Choo!
						</h1>
						<p class="py-2">All aboard the Grace Train!</p>
						<p class="py-2">Design your own cars and watch them on stream!</p>
					</div>
					<div class="flex max-w-lg flex-col items-center">
						<a
							href="/login"
							data-sveltekit-reload
							class="nunito btn btn-secondary btn-lg mb-4">Twitch Login</a
						>
						<a href="/design/new" class="link opacity-70 hover:opacity-100"
							>Just start designing</a
						>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	.train-scroll {
		animation: scroll 12s linear infinite;
		will-change: transform;
	}
	@keyframes scroll {
		100% {
			transform: translateX(calc(calc(64px + 8px) * -6));
		}
	}
</style>
