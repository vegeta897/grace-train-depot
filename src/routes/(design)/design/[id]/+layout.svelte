<script lang="ts">
	import { page } from '$app/stores'
	import { getDesignStores } from '../stores'
	import type { LayoutData } from './$types'
	import { cloneCar, getCarChangesByPage, getNewCar } from '$lib/car'
	import { PAGES } from '$lib/common/constants'
	import { goto, onNavigate } from '$app/navigation'
	import { objectContainsTrue } from '$lib/util'
	import NavTabs from './NavTabs.svelte'

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
	const savedCar = data.savedCar
	if ($designShortId !== 'new' && savedCar) {
		// TODO: Test SSR
		if (
			!$localCars[$designShortId] ||
			(savedCar.revision || 0) > ($localCars[$designShortId].revision || 0)
		) {
			localCars.update((lc) => {
				lc[$designShortId] = cloneCar(savedCar)
				return lc
			})
		}
	}

	// TODO: For first car, add new pages as they are visited

	const routePageName = (routeID?: string | null) => routeID?.split('/')[4] || ''

	$: currentPage = routePageName($page.route.id)
	$: designChanges = getCarChangesByPage(data.savedCar || $designCar, $designCar)
	$: backLink = $page.params.id === 'new' ? '/' : `/c/${$page.params.id}`

	const viewTransitionAnimationOptions: KeyframeAnimationOptions = {
		duration: 300,
		easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
		fill: 'both',
	}

	onNavigate((navigation) => {
		if (!document.startViewTransition) return
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
		if (window.matchMedia('(min-width: 1024px)').matches) return
		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
			const [fromPageIndex, toPageIndex] = [
				navigation.from?.route.id,
				navigation.to?.route.id,
			].map((fromOrToPage) =>
				PAGES.findIndex((page) => page[1] === routePageName(fromOrToPage))
			)
			const animateLeft = toPageIndex > fromPageIndex
			transition.ready.then(() => {
				document.documentElement.animate(
					{
						transform: ['', `translateX(${animateLeft ? '-' : ''}100%)`],
						opacity: [1, 0],
					},
					{
						...viewTransitionAnimationOptions,
						pseudoElement: '::view-transition-old(design-page-content)',
					}
				)
				document.documentElement.animate(
					{
						transform: [`translateX(${animateLeft ? '' : '-'}100%)`, ''],
						opacity: [0, 1],
					},
					{
						...viewTransitionAnimationOptions,
						pseudoElement: '::view-transition-new(design-page-content)',
					}
				)
			})
		})
	})

	function exitDesigner(e: Event) {
		// TODO: Use daisyui modal component
		// TODO: Show side-by-side comparison of original car and unsaved car
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
	<div class="hidden sm:flex lg:hidden">
		<NavTabs {currentPage} carShortId={$page.params.id} />
	</div>
	{#if currentPage !== 'finish'}
		<a
			href="/design/{$page.params.id}/finish"
			class="btn btn-success btn-outline btn-sm h-[2.5rem] min-h-[2.5rem] text-lg font-black"
		>
			Finish
		</a>
	{/if}
</header>
<div class="mx-auto mt-2 max-w-2xl lg:mt-4 lg:flex lg:max-w-full lg:items-start">
	<div class="sticky top-2 hidden w-80 shrink-0 flex-col gap-4 lg:flex">
		<div class="rounded-box flex flex-col gap-2 bg-neutral p-6">
			<!-- <div class="flex items-baseline justify-between px-2">
				<h2 class="font-black uppercase text-2xl mb-2">Design</h2>
			</div> -->
			<!-- TODO: Consider a non-button treatment for this -->
			{#each PAGES as [icon, name]}
				{@const current = name === currentPage}
				<a
					href="/design/{$page.params.id}/{name}"
					class="btn btn-lg btn-block justify-start gap-8 text-xl font-black"
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
		<div class="mx-2 justify-center self-stretch xs:self-center sm:hidden">
			<NavTabs {currentPage} carShortId={$page.params.id} />
		</div>
		{#if currentPage}
			<h2 class="mt-3 text-3xl font-black uppercase">{currentPage}</h2>
		{/if}
		<div
			class="self-stretch p-4 lg:grow lg:px-8"
			style:view-transition-name="design-page-content"
		>
			<slot />
		</div>
	</div>
</div>

<style>
	/* Override default view transition because we're handling it in JS */
	:root::view-transition-image-pair(design-page-content) {
		isolation: auto;
	}
	:root::view-transition-old(design-page-content),
	:root::view-transition-new(design-page-content) {
		animation: none;
		mix-blend-mode: normal;
		display: block;
	}
</style>
