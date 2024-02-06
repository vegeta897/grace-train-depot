<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside'
	import type { LayoutData } from './$types'
	import { onNavigate } from '$app/navigation'
	import Icon from '$lib/components/Icon.svelte'
	import { getAppStores } from './store'
	import { fade } from 'svelte/transition'
	import { cubicIn } from 'svelte/easing'
	import { flip } from 'svelte/animate'

	export let data: LayoutData

	let menuElement: HTMLDetailsElement

	const { toasts } = getAppStores()

	const closeMenu = () => menuElement?.removeAttribute('open')
	onNavigate(() => closeMenu())
</script>

<svelte:head><title>Choo Choo!</title></svelte:head>
<header
	class="navbar min-h-12 flex gap-2 bg-base-200 p-0 px-6 sm:rounded-box sm:min-h-16"
>
	<!-- <h1 class="font-black text-left text-3xl uppercase">
			🚂
			<span class="hidden">Choo Choo!</span>
		</h1> -->
	<h1 class="grow text-xl font-black uppercase tracking-wide sm:text-2xl">
		<a href="/">Choo Choo!</a>
	</h1>
	{#if data.user}
		<h2 class="hidden items-end gap-2 font-bold sm:flex">
			<Icon icon="twitch" class="size-5" />
			{data.user.twitchDisplayName}
		</h2>
		{#if data.user.isMod}
			<!-- TODO: Create mod icon -->
			<a href="/mod" class="btn btn-ghost">Mod 🛡️</a>
		{/if}
		<nav class="flex-none">
			<details
				bind:this={menuElement}
				class="dropdown dropdown-end"
				use:clickoutside={{}}
				on:clickoutside={closeMenu}
			>
				<summary class="btn btn-square btn-ghost">
					<!-- TODO: Move to Icon.svelte -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block size-7 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</summary>
				<ul class="menu dropdown-content rounded-box z-50 bg-neutral p-2 shadow">
					{#if data.user}
						<li
							class="menu-title flex-row flex-nowrap items-center justify-end gap-2 text-base-content/70 sm:hidden"
						>
							<Icon icon="twitch" class="size-4" />
							{data.user.twitchDisplayName}
						</li>
					{/if}
					<li>
						<a href="/" class="justify-end">home</a>
					</li>
					<!-- {#if data.user.isMod}<li>
							<a class="justify-end" href="/mod">🛡️ mod view</a>
						</li>
					{/if} -->
					<li>
						<a data-sveltekit-reload href="/logout" class="justify-end whitespace-nowrap"
							>log out</a
						>
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
<div class="toast toast-center toast-top">
	{#each $toasts as toast (toast)}
		<div
			animate:flip
			class="alert alert-info grid-flow-col"
			out:fade={{ duration: 200, easing: cubicIn }}
		>
			<!-- TODO: Move to Icon.svelte, use toast.type -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>{toast.message}</span>
		</div>
	{/each}
</div>
