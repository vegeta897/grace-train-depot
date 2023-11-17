<script lang="ts">
	import { Car } from 'grace-train-lib/components'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { COLORS } from 'grace-train-lib'

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
				<div class="tooltip tooltip-bottom tooltip-success" data-tip="Make a new car">
					<a
						href="/design/new"
						data-sveltekit-preload-data="tap"
						class="btn btn-outline btn-block h-[8.75rem] text-8xl font-black">+</a
					>
				</div>
				<!-- TODO: Maybe separate live cars vs drafts -->
				{#if data.savedCars}
					{#each data.savedCars as car}
						<div class="indicator w-full">
							<span
								class="badge indicator-item indicator-center indicator-bottom font-black uppercase tracking-wide"
								class:badge-primary={car.published}
								class:badge-warning={!car.published}
							>
								{#if car.published}Live{:else}Draft{/if}
							</span>
							<a
								href="/c/{car.shortId}"
								data-sveltekit-preload-data="tap"
								class="btn-hover-grow btn btn-block h-[8.75rem] text-xl font-black"
							>
								<div class="flex max-w-full flex-col items-center gap-1 px-2 normal-case">
									<div class="w-24"><Car {car} /></div>
									{#if car.name}
										<span
											class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
											>{car.name}</span
										>
									{/if}
								</div>
							</a>
						</div>
					{/each}
				{/if}
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
						<p class="py-2 text-xl">All aboard the Grace Train!</p>
						<p class="py-2 text-lg">Design your own cars and see them on stream!</p>
					</div>
					<div class="flex max-w-lg flex-col items-center">
						<a
							href="/login"
							data-sveltekit-reload
							class="btn btn-secondary btn-lg mb-4 font-black tracking-wide"
							>Twitch Login</a
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
		animation: scroll 16s linear infinite;
		will-change: transform;
	}
	@keyframes scroll {
		100% {
			transform: translateX(calc(calc(64px + 6px) * -8));
		}
	}
</style>
