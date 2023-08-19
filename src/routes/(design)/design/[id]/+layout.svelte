<script lang="ts">
	import { page } from '$app/stores'
	import { getDesignStores } from '../stores'
	import type { LayoutData } from './$types'
	import { cloneCar, getCarChangesByPage, getNewCar } from '$lib/car'
	import { PAGES } from '$lib/common/constants'
	import { goto } from '$app/navigation'
	import { objectContainsTrue } from '$lib/util'

	export let data: LayoutData

	const { localCars, designShortId, designCar } = getDesignStores()

	// TODO: Warn if refresh/navigate is attempted without saving?

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

	$: currentPage = $page.route.id?.split('/')[4]
	$: designChanges = getCarChangesByPage(data.savedCar || $designCar, $designCar)
	$: backLink = $page.params.id === 'new' ? '/' : `/c/${$page.params.id}`

	function exitDesigner(e: Event) {
		if (currentPage === 'finish') {
			if (confirm('Exit without finishing your car?')) goto(backLink)
			else return e.preventDefault()
		}
		const carChanged = objectContainsTrue(designChanges)
		if (!carChanged) return
		if (confirm('You have unsaved changes!')) goto(backLink)
		else e.preventDefault()
	}
</script>

<header
	class="navbar min-h-12 flex justify-between bg-base-200 p-2 lg:rounded-box lg:min-h-16 lg:p-3 lg:px-4"
>
	<a
		href={backLink}
		on:click={exitDesigner}
		class="btn btn-neutral h-[2.5rem] min-h-[2.5rem] px-6">Back</a
	>
	{#if currentPage !== 'finish'}
		<a
			href="/design/{$page.params.id}/finish"
			class="nunito btn btn-success btn-outline btn-sm h-[2.5rem] min-h-[2.5rem] text-lg"
		>
			Finish
		</a>
	{/if}
</header>
<div class="mx-auto mt-4 max-w-2xl lg:flex lg:max-w-full lg:items-start">
	<div class="hidden w-80 shrink-0 flex-col gap-4 lg:flex">
		<div class="rounded-box flex flex-col gap-2 bg-neutral p-6">
			<!-- <div class="flex items-baseline justify-between px-2">
				<h2 class="nunito uppercase text-2xl mb-2">Design</h2>
			</div> -->
			{#each PAGES as [icon, name]}
				{@const current = name === currentPage}
				<a
					href="/design/{$page.params.id}/{name}"
					class="nunito btn btn-lg btn-block justify-start gap-8 text-xl"
					class:pointer-events-none={current}
					class:btn-primary={current}
				>
					<div class="w-12 text-4xl">{icon}</div>
					{name}
				</a>
			{/each}
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
		</div>
		{#if currentPage}
			<h2 class="nunito mt-3 text-3xl uppercase">{currentPage}</h2>
		{/if}
		<div class="self-stretch p-4 lg:grow lg:px-8">
			<slot />
		</div>
	</div>
</div>
