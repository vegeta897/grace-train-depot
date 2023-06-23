<script lang="ts">
	import '../app.postcss'
	import '@fontsource/nunito/900.css'
	import '@fontsource-variable/nunito'
	import './styles.css'
	import { clickoutside } from '@svelte-put/clickoutside'

	let menuElement: HTMLDetailsElement

	const closeMenu = () => menuElement.removeAttribute('open')

	// TODO: Bento grid? https://bentogrids.com/
</script>

<svelte:head>
	<title>Grace Train Depot</title>
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>
<div class="mx-auto w-full max-w-5xl lg:p-6">
	<header class="navbar mb-4 bg-base-200 px-6 lg:rounded-box">
		<h1 class="nunito flex-1 text-left text-2xl uppercase">
			<span class="text-3xl sm:hidden">🚂</span>
			<span class="hidden sm:inline">Grace Train Depot</span>
		</h1>
		<nav class="flex-none">
			<details
				bind:this={menuElement}
				class="dropdown-end dropdown"
				use:clickoutside
				on:clickoutside={closeMenu}
			>
				<summary class="btn m-1"
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
				<ul class="dropdown-content menu rounded-box w-32 bg-neutral p-2 shadow">
					<li>
						<a on:click={closeMenu} href="/" class="justify-end">Home</a>
					</li>
					<li>
						<a on:click={closeMenu} href="/" class="justify-end text-error">Log out</a>
					</li>
				</ul>
			</details>
		</nav>
	</header>
	<slot />
</div>
