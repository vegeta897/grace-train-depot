<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { Body } from 'grace-train-lib'
	import type { PageData } from './$types'
	import { DECAL_COLORS } from '$lib/common/constants'

	export let data: PageData
</script>

<section class="flex flex-col items-center justify-center p-4 md:p-8 h-[75vh]">
	{#if data.user}
		<!-- TODO: Move this to a /me or /depot route -->
		<div class="w-full max-w-lg rounded-2xl bg-neutral p-6 md:p-10">
			<h2 class="mb-4 text-xl">Hello, {data.user.twitchDisplayName}!</h2>
			<div class="grid grid-cols-1 gap-y-4">
				<a
					href="design/new"
					data-sveltekit-preload-data="tap"
					class="nunito btn btn-outline btn-block h-32 text-8xl">+</a
				>
				{#each data.savedCars as car}
					<a
						href="design/{car.shortId}"
						data-sveltekit-preload-data="tap"
						class="nunito btn btn-block h-32 text-8xl"
					>
						<div class="w-32">
							<UserCar {car} />
						</div>
					</a>
				{/each}
			</div>
		</div>
	{:else}
		<div class="hero bg-base-200 max-w-3xl rounded-2xl sm:py-8 pb-4">
			<div class="hero-content px-6 flex-col min-w-0 max-w-full">
				<div
					class="py-8 sm:py-16 flex overflow-clip max-w-full relative min-w-0"
					style="--fade-sides: linear-gradient(90deg, rgba(0,0,0,0) 0, rgba(0,0,0,1) 20% 80%, rgba(0,0,0,0) 100%)"
					style:-webkit-mask="var(--fade-sides)"
					style:mask="var(--fade-sides)"
				>
					<div class="sm:scale-200 scale-125 origin-left">
						<div style:left="-4rem" class="relative train-scroll whitespace-nowrap">
							{#each Array(12) as _, i}
								<div class="w-16 mx-[4px] inline-block">
									<Body color={DECAL_COLORS[i % DECAL_COLORS.length]} name="boxy" />
								</div>
							{/each}
						</div>
					</div>
				</div>
				<div
					class="flex flex-col sm:flex-row gap-4 sm:gap-16 items-stretch sm:items-center"
				>
					<div class="max-w-lg flex flex-col items-start">
						<h1
							class="xs:text-5xl text-4xl whitespace-nowrap nunito uppercase pb-1 xs:pb-2"
						>
							Choo Choo!
						</h1>
						<p class="py-2">All aboard the Grace Train!</p>
						<p class="py-2">Design your own cars and watch them on stream!</p>
					</div>
					<div class="max-w-lg flex flex-col items-center">
						<a href="login" class="nunito btn-secondary btn btn-lg mb-4">Twitch Login</a>
						<a href="design/new" class="link opacity-70 hover:opacity-100"
							>Just start designing</a
						>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>

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
