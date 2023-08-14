<script lang="ts">
	import type { PageData, SubmitFunction, ActionData } from './$types'
	import { page } from '$app/stores'
	import Car from '$lib/components/Car.svelte'
	import { COLORS } from 'grace-train-lib'
	import { PUBLIC_HOST } from '$env/static/public'
	import { fade } from 'svelte/transition'
	import { cubicIn } from 'svelte/easing'
	import { applyAction, enhance } from '$app/forms'
	import { tick } from 'svelte'
	import { invalidateAll } from '$app/navigation'

	export let data: PageData
	export let form: ActionData

	$: imageUrl = `${PUBLIC_HOST}/assets/car_${data.car.shortId}_${data.car.revision}.png`

	let rename = false
	let renamed = false
	let copied = false
	let nameInput: HTMLInputElement

	const enableRename = async () => {
		rename = true
		await tick()
		nameInput?.select()
	}

	const onRename: SubmitFunction = () => {
		return async ({ result }) => {
			await applyAction(result)
			rename = false
			renamed = true
			setTimeout(() => (renamed = false), 3000)
			invalidateAll()
		}
	}

	function copyLink() {
		navigator.clipboard.writeText(PUBLIC_HOST + $page.url.pathname)
		copied = true
		setTimeout(() => (copied = false), 3000)
	}
</script>

<svelte:head>
	<meta property="og:title" content="Grace Train Depot" />
	<meta property="twitter:title" content="Grace Train Depot" />
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:image" content={imageUrl} />
	<meta name="twitter:creator" content="@vegeta897" />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="375" />
	<meta property="og:image:height" content="300" />
	<meta name="theme-color" content="${COLORS.POP}" />
</svelte:head>
<section class="flex flex-col items-center gap-4 px-4 py-8 lg:flex-row lg:px-8">
	<div class="flex grow flex-col items-center gap-4 px-4 lg:px-12">
		<div class="max-w-[20rem]"><Car car={data.car} /></div>
	</div>
	<div
		class="rounded-box flex w-full max-w-lg flex-col items-center gap-4 bg-neutral p-4 lg:p-8"
	>
		{#if !rename}
			<button
				class="nunito btn btn-ghost btn-lg text-4xl normal-case"
				class:[&:not(:hover)]:opacity-70={!data.car.name}
				on:click={enableRename}>{data.car.name || '(no name)'}</button
			>
			<a
				href="/design/{data.car.shortId}"
				class="nunito btn btn-primary rounded-box btn-lg btn-block h-20 text-4xl"
				>Design</a
			>
			<div class="flex gap-4">
				<button class="btn btn-secondary" on:click={copyLink}>Copy Link</button>
			</div>
		{:else}
			<form
				action="?/rename"
				method="POST"
				use:enhance={onRename}
				class="flex flex-col gap-3"
			>
				<input
					type="text"
					name="carName"
					class="input w-full max-w-xs text-2xl"
					value={data.car.name || ''}
					placeholder="Type a name"
					bind:this={nameInput}
				/>
				<button class="btn btn-primary btn-lg">Save</button>
			</form>
		{/if}
	</div>
</section>
<div class="flex justify-center">
	<a href="/" class="btn btn-lg">Back</a>
</div>
<div class="toast toast-center toast-top">
	{#if copied}
		<div
			class="alert alert-info grid-flow-col"
			out:fade={{ duration: 200, easing: cubicIn }}
		>
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
			<span>Link copied!</span>
		</div>
	{/if}
	{#if renamed}
		<div
			class="alert alert-success grid-flow-col"
			out:fade={{ duration: 200, easing: cubicIn }}
		>
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
			<span>Car renamed!</span>
		</div>
	{/if}
</div>
