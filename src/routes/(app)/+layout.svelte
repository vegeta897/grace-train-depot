<script lang="ts">
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

<header
	class="navbar min-h-12 grid grid-cols-3 bg-base-200 p-0 px-6 lg:rounded-box lg:min-h-16"
>
	<!-- <h1 class="nunito text-left text-3xl uppercase">
			🚂
			<span class="hidden">Grace Train Depot</span>
		</h1> -->
	{#if design}
		<h2 class="nunito text-2xl uppercase">
			<a href="/design/{carId}">Design</a>
		</h2>
	{/if}
	<nav class="col-start-3 flex-none justify-self-end">
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
			<ul class="menu dropdown-content rounded-box z-50 w-32 bg-neutral p-2 shadow">
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
