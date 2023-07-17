<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<section class="flex flex-col items-center justify-center p-4 md:p-8">
	<div class="w-full max-w-lg rounded-2xl bg-neutral p-6 md:p-10">
		{#if data.user}
			<h2 class="mb-4 text-xl">Hello, {data.user.twitchDisplayName}!</h2>
			<div class="grid grid-cols-1 gap-y-4">
				<a
					href="design/new"
					data-sveltekit-preload-data="tap"
					class="nunito btn btn-outline btn-block h-32 text-8xl">+</a
				>
				{#each data.cars as car}
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
		{:else}
			<a href="login" class="nunito btn btn-lg">Log in with Twitch</a>
		{/if}
	</div>
</section>
