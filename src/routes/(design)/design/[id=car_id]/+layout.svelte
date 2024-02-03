<script lang="ts">
	import { page } from '$app/stores'
	import { getDesignStores } from './stores'
	import type { LayoutData } from './$types'
	import { cloneCar, getCarChangesByPage, getNewDesignCar } from '$lib/car'
	import { PAGES } from '$lib/common/constants'
	import { goto, onNavigate } from '$app/navigation'
	import { capitalize, objectContainsTrue } from '$lib/util'
	import NavTabs from './NavTabs.svelte'
	import { browser } from '$app/environment'
	import { onDestroy } from 'svelte'
	import ThemeGoals from './ThemeGoals.svelte'
	import { THEMES, type ThemeName } from '$lib/themes'

	export let data: LayoutData

	const { localCars, designShortId, designCar, updateDesignCar } = getDesignStores()

	// TODO: Warn if refresh/navigate is attempted without saving?

	if (browser) {
		// Do not modify any stores on the server!
		designShortId.set($page.params.id)
		if ($designShortId === 'new' && !$localCars.new) {
			updateDesignCar(() => getNewDesignCar())
		}
		if ($page.url.searchParams.has('theme')) {
			const themeGoal = $page.url.searchParams.get('theme') as ThemeName
			if (THEMES.includes(themeGoal) && !$designCar.themeGoals.includes(themeGoal)) {
				updateDesignCar((car) => {
					car.themeGoals.push(themeGoal)
				})
			}
			goto($page.url.pathname, { replaceState: true }) // Consume searchParams
		}
		const savedCar = data.savedCar
		if ($designShortId !== 'new' && savedCar) {
			if (
				!$localCars[$designShortId] ||
				(savedCar.revision || 0) > ($localCars[$designShortId].revision || 0)
			) {
				updateDesignCar(() => cloneCar(savedCar))
			}
		}
	}

	const routePageName = (routeID?: string | null) => routeID?.split('/')[4] || PAGES[0][1]

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
		if (!navigation.to?.route.id?.startsWith('/(design)/design/')) return
		if (navigation.to?.route.id === navigation.from?.route.id) return
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
		// if (matchMedia('(min-width: 1024px)').matches) return
		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
			const [fromPageIndex, toPageIndex] = [
				navigation.from?.route.id,
				navigation.to?.route.id,
			].map((fromOrToPage) => {
				const pageName = routePageName(fromOrToPage)
				if (pageName === 'finish') return Infinity
				return PAGES.findIndex((page) => page[1] === pageName)
			})
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
		// Diff component (not supported on iOS) https://daisyui.com/components/diff/
		const newCar = $designShortId === 'new'
		const carChanged = objectContainsTrue(designChanges)
		if (!newCar && !carChanged) return
		if (
			!confirm(
				newCar ? "You haven't finished your car!" : 'Your changes will not be saved!'
			)
		)
			e.preventDefault()
	}

	onDestroy(() => {
		if ($designShortId !== 'new')
			localCars.update((cars) => {
				delete cars[$designShortId]
				return cars
			})
	})
</script>

<svelte:head><title>Choo Choo {capitalize(currentPage || 'design')}!</title></svelte:head>
<header
	class="navbar min-h-12 flex shrink-0 justify-between bg-base-200 p-2 sm:rounded-box lg:min-h-16 sm:p-3 sm:px-4"
>
	<a
		href={backLink}
		on:click={exitDesigner}
		class="btn btn-neutral h-[2.5rem] min-h-[2.5rem] w-24 lg:h-20 lg:text-lg">Back</a
	>
	<div class="hidden sm:flex">
		<NavTabs {currentPage} carShortId={$page.params.id} />
	</div>
	{#if currentPage}
		<h2 class="my-2 text-2xl font-black uppercase tracking-wide sm:hidden">
			{currentPage}
		</h2>
	{/if}
	<a
		href="/design/{$page.params.id}/finish"
		class="btn btn-success h-[2.5rem] min-h-[2.5rem] w-24 text-lg lg:h-20"
		class:pointer-events-none={currentPage === 'finish'}
		class:btn-outline={currentPage !== 'finish'}
	>
		Finish
	</a>
</header>
<div class="mx-auto w-full max-w-2xl grow gap-x-4 lg:max-w-full">
	<div class="flex min-w-0 grow flex-col items-center">
		<div class="mx-2 mt-2 justify-center self-stretch xs:self-center sm:hidden">
			<NavTabs {currentPage} carShortId={$page.params.id} />
		</div>
		{#if currentPage}
			<h2
				class="my-2 hidden text-3xl font-black uppercase tracking-wide sm:block lg:hidden"
			>
				{currentPage}
			</h2>
		{/if}
		<div
			class="self-stretch p-2 sm:p-0 lg:grow lg:p-4 lg:py-6"
			style:view-transition-name="design-page-content"
		>
			<slot />
		</div>
	</div>
</div>
<div class="overflow-y-hidden">
	{#if browser && $designCar.themeGoals.length > 0}
		<ThemeGoals car={$designCar} />
	{/if}
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
