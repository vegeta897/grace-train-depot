<script lang="ts">
	import { page } from '$app/stores'
	import { fade, fly } from 'svelte/transition'
	import { getDesignStores } from '../stores'
	import type { LayoutData } from './$types'
	import { cloneCar, getCarChangesByPage, getNewCar } from '$lib/car'
	import { PAGES } from '$lib/common/constants'

	export let data: LayoutData

	const { localCars, designShortId, designCar } = getDesignStores()

	// TODO: Only overwrite local car from saved car if lastModified is newer
	// Warn if refresh/navigate is attempted without saving?

	designShortId.set($page.params.id)
	if ($designShortId === 'new' && !$localCars.new) {
		localCars.update((lc) => {
			lc.new = getNewCar()
			return lc
		})
	}
	if ($designShortId !== 'new' && data.savedCar) {
		// TODO: Test SSR
		if (
			!$localCars[$designShortId] ||
			(data.savedCar.revision || 0) > ($localCars[$designShortId].revision || 0)
		) {
			localCars.update((lc) => {
				lc[$designShortId] = cloneCar(data.savedCar!)
				return lc
			})
		}
	}

	// TODO: For first car, add new pages as they are visited

	let saving = true
	setTimeout(() => (saving = false))

	$: currentPage = $page.route.id?.split('/')[3]
	$: designChanges = getCarChangesByPage(data.savedCar || $designCar, $designCar)
</script>

<div class="mx-auto mt-4 max-w-2xl lg:flex lg:max-w-full lg:items-start">
	<div class="hidden w-80 shrink-0 flex-col lg:flex">
		<div class="rounded-box flex flex-col gap-2 bg-neutral p-6">
			<!-- <div class="flex items-baseline justify-between px-2">
				<h2 class="nunito uppercase text-2xl mb-2">Design</h2>
			</div> -->
			{#each PAGES as [icon, name]}
				{@const current = name === currentPage}
				<div class="indicator w-full">
					{#if designChanges[name]}
						<!-- TODO: This is bad because it looks like the user needs to visit this page to save changes -->
						<span
							in:fade={{ duration: 150 }}
							class="badge indicator-item badge-warning indicator-start indicator-middle"
						/>
					{/if}
					<a
						href="/design/{$page.params.id}/{name}"
						class="nunito btn btn-lg btn-block justify-start gap-8 text-xl"
						class:pointer-events-none={current}
						class:btn-primary={current}
					>
						<div class="w-12 text-center text-4xl">{icon}</div>
						{name}
					</a>
				</div>
			{/each}
			{#if Object.values(designChanges).some((v) => v)}
				<div class="indicator w-full" in:fade={{ duration: 150 }}>
					<span
						class="badge indicator-item badge-warning indicator-start indicator-middle"
					/>
					<div class="px-5 py-2">Unsaved changes</div>
				</div>
			{/if}
		</div>
	</div>
	<div class="flex min-w-0 grow flex-col items-center">
		<div
			class="tabs-boxed tabs mx-2 justify-center self-stretch xs:self-center lg:hidden"
		>
			{#each PAGES as [icon, name]}
				{@const current = name === currentPage}
				<a
					data-sveltekit-noscroll
					class:pointer-events-none={current}
					class:tab-active={current}
					href="/design/{$page.params.id}/{name}"
					class="tab h-11 grow px-0 text-2xl 2xs:h-12 2xs:text-3xl xs:px-[var(--tab-padding,1rem)]"
				>
					{icon}
				</a>
			{/each}
			{#if !saving}
				<div class="toast toast-center" in:fly={{ y: 100 }}>
					<div class="alert alert-success grid-flow-col">
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
						<span>Saved</span>
					</div>
				</div>
			{/if}
		</div>
		{#if currentPage}
			<h2 class="nunito mt-3 text-3xl uppercase">{currentPage}</h2>
		{/if}
		<div class="self-stretch p-4 lg:grow lg:px-8">
			<slot />
		</div>
	</div>
</div>
