<script lang="ts">
	import { page } from '$app/stores'
	import { fly } from 'svelte/transition'
	import type { PageData } from './$types'
	import { getDesignStores } from '../stores'

	export let data: PageData

	const { displayCar } = getDesignStores()

	const pages = [
		['🚌', 'body'],
		['🎓', 'toppers'],
		['🎡', 'wheels'],
		['💟', 'decals'],
		['✨', 'effects'],
		['🚥', 'finish'],
	]

	// TODO: For first car, add new pages as they are visited

	let saving = true
	setTimeout(() => (saving = false))

	$: currentPage = $page.route.id?.split('/')[3]
</script>

<div class="lg:flex lg:items-start max-w-2xl lg:max-w-full mx-auto">
	<div class="hidden w-80 flex-col shrink-0 lg:flex">
		<div class="rounded-box bg-neutral space-y-2 p-6 flex flex-col">
			<!-- <div class="flex items-baseline justify-between px-2">
				<h2 class="nunito uppercase text-2xl mb-2">Design</h2>
			</div> -->
			{#each pages as [icon, name]}
				{@const current = name === currentPage}
				<a
					href="/design/{$page.params.id}/{name}"
					class="nunito btn btn-lg btn-block justify-start gap-8 text-xl"
					class:pointer-events-none={current}
					class:btn-active={current}
				>
					<div class="w-12 text-center text-4xl">{icon}</div>
					{name}
				</a>
			{/each}
		</div>
		{#if currentPage}
			<div class="rounded-box bg-neutral mt-4 p-6 justify-between items-baseline flex">
				<!-- <span class="badge badge-lg opacity-80">Saved</span> -->
				<!-- <span class="badge badge-lg badge-warning">Unsaved</span> -->
				<!-- <span
				class="badge badge-lg transition-all"
				style:transition-duration="0.5s"
				class:badge-success={!saving}
				class:badge-warning={saving}>{saving ? 'Saving' : 'Saved'}</span
			> -->
				{#if $displayCar.shortId === 'new'}
					<div>
						<p class="mb-4">Link your account to save and publish this car</p>
						<a href="login" class="btn btn-secondary nunito">Twitch Login</a>
					</div>
				{:else}
					<label class="label cursor-pointer">
						<span class="label-text text-base">Auto-save</span>
						<input type="checkbox" checked class="checkbox checkbox-info ml-2" />
					</label>
					<button class="btn nunito btn-success">Save</button>
				{/if}
			</div>
		{/if}
	</div>
	<div class="grow space-y-2 flex flex-col items-center min-w-0">
		<div
			class="lg:hidden tabs tabs-boxed self-stretch xs:self-center mx-2 justify-center"
		>
			{#each pages as [icon, name]}
				{@const current = name === currentPage}
				<a
					data-sveltekit-noscroll
					class:pointer-events-none={current}
					class:tab-active={current}
					href="/design/{$page.params.id}/{name}"
					class="tab text-2xl 2xs:text-3xl h-11 2xs:h-12 grow px-0 xs:px-[var(--tab-padding,1rem)]"
				>
					{icon}
				</a>
			{/each}
			{#if !saving}
				<div class="toast toast-center" in:fly={{ y: 100 }}>
					<div class="alert alert-success grid-flow-col">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="stroke-current shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
						<span>Saved</span>
					</div>
				</div>
			{/if}
		</div>
		{#if currentPage}
			<h2 class="nunito uppercase text-3xl">{currentPage}</h2>
		{/if}
		<div class="p-4 lg:grow lg:px-8 lg:py-0 self-stretch">
			<slot />
		</div>
	</div>
</div>
