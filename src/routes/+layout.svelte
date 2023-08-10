<script lang="ts">
	import '@fontsource/nunito/900.css'
	import '@fontsource-variable/nunito'
	import '@fontsource-variable/open-sans'
	import '../app.postcss'
	import './styles.css'
	import { clickoutside } from '@svelte-put/clickoutside'
	import { page } from '$app/stores'
	import type { LayoutData } from './$types'

	export let data: LayoutData

	let menuElement: HTMLDetailsElement

	const closeMenu = () => menuElement.removeAttribute('open')

	$: design = $page.route.id?.startsWith('/design')
	$: carId = design && $page.params.id

	// TODO: Bento grid? https://bentogrids.com/
</script>

<svelte:head>
	<title>Grace Train Depot</title>
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>
<div class="mx-auto w-full max-w-5xl pb-4 lg:p-4">
	<header
		class="navbar grid grid-cols-3 mb-4 bg-base-200 min-h-12 lg:min-h-16 p-0 px-6 lg:rounded-box"
	>
		<!-- <h1 class="nunito text-left text-3xl uppercase">
			🚂
			<span class="hidden">Grace Train Depot</span>
		</h1> -->
		{#if design}
			<h2 class="nunito uppercase text-2xl">
				<a href="/design/{carId}">Design</a>
			</h2>
		{/if}
		<nav class="flex-none justify-self-end col-start-3">
			<details
				bind:this={menuElement}
				class="dropdown dropdown-end"
				use:clickoutside={{}}
				on:clickoutside={closeMenu}
			>
				<summary class="btn"
					><svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block h-6 w-6 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/></svg
					></summary
				>
				<ul class="menu dropdown-content rounded-box w-32 bg-neutral p-2 shadow z-50">
					<li>
						<a on:click={closeMenu} href="/" class="justify-end">Home</a>
					</li>
					<li>
						<a on:click={closeMenu} href="/terms" class="justify-end">Terms</a>
					</li>
					<li>
						<a on:click={closeMenu} href="/privacy" class="justify-end">Privacy</a>
					</li>
					{#if data.user}
						<li>
							<a
								data-sveltekit-reload
								on:click={closeMenu}
								href="/logout"
								class="justify-end">Log out</a
							>
						</li>
					{/if}
				</ul>
			</details>
		</nav>
	</header>
	<slot />
</div>
