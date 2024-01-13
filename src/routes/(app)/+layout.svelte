<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside'
	import type { LayoutData } from './$types'
	import { onNavigate } from '$app/navigation'

	export let data: LayoutData

	let menuElement: HTMLDetailsElement

	const closeMenu = () => menuElement.removeAttribute('open')
	onNavigate(closeMenu)
</script>

<svelte:head><title>Choo Choo!</title></svelte:head>
<header
	class="navbar min-h-12 flex justify-between bg-base-200 p-0 px-6 sm:rounded-box sm:min-h-16"
>
	<!-- <h1 class="font-black text-left text-3xl uppercase">
			🚂
			<span class="hidden">Choo Choo!</span>
		</h1> -->
	<h2 class="text-xl font-black uppercase tracking-wide sm:text-2xl">
		<a href="/">Choo Choo!</a>
	</h2>
	{#if data.user}
		<nav class="flex-none">
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
				<ul class="menu dropdown-content rounded-box z-50 w-36 bg-neutral p-2 shadow">
					<li>
						<a href="/" class="justify-end">home</a>
					</li>
					{#if data.user.isMod}<li>
							<a class="justify-end" href="/mod">🛡️ mod view</a>
						</li>
					{/if}
					<li>
						<a data-sveltekit-reload href="/logout" class="justify-end">log out</a>
					</li>
				</ul>
			</details>
		</nav>
	{/if}
</header>
<slot />
<footer
	class="footer footer-center mt-auto gap-y-4 bg-base-200 p-6 text-base-content sm:rounded-box"
>
	<nav class="grid grid-flow-col gap-4">
		<a class="link-hover link" href="/">home</a>
		<a class="link-hover link" href="/terms">terms of use</a>
		<a
			class="link-hover link"
			href="https://github.com/vegeta897/grace-train-depot"
			rel="external">github</a
		>
	</nav>
	<aside>
		<p class="text-base-content/75">created by vegeta897<br />for the sweeties</p>
	</aside>
</footer>
