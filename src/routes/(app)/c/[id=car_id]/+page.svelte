<script lang="ts">
	import type { PageData, SubmitFunction } from './$types'
	import { page } from '$app/stores'
	import { COLORS } from 'grace-train-lib'
	import { PUBLIC_HOST } from '$env/static/public'
	import { fade } from 'svelte/transition'
	import { cubicIn } from 'svelte/easing'
	import { applyAction, enhance } from '$app/forms'
	import { tick } from 'svelte'
	import { invalidateAll } from '$app/navigation'
	import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'
	import { Car } from 'grace-train-lib/components'

	export let data: PageData

	$: imageUrl = `${PUBLIC_HOST}/assets/car_${data.car.shortId}_${data.car.revision}.png`

	let renaming = false
	let renamed = false
	let copied = false
	let nameInput: HTMLInputElement

	const enableRename = async () => {
		renaming = true
		await tick()
		nameInput?.select()
	}

	const onRename: SubmitFunction = ({ formData, cancel }) => {
		if (formData.get('carName') === (data.car.name || '')) {
			renaming = false
			return cancel()
		}
		return async ({ result }) => {
			await applyAction(result)
			renaming = false
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
	<meta property="og:title" content="Choo Choo!" />
	<meta property="twitter:title" content="Choo Choo!" />
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:image" content={imageUrl} />
	<meta name="twitter:creator" content="@vegeta897" />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="375" />
	<meta property="og:image:height" content="300" />
	<meta name="theme-color" content="${COLORS.POP[1]}" />
</svelte:head>
<section class="flex flex-col items-center gap-4 px-4 py-8 lg:flex-row lg:px-8">
	<div
		class="flex grow flex-col items-center gap-4 p-4 lg:p-8"
		style:min-width="min(400px, 100%)"
	>
		<div class="max-w-[20rem]"><Car car={data.car} /></div>
	</div>
	{#if data.car.belongsToUser}
		<div
			class="rounded-box flex w-full max-w-lg flex-col items-center gap-4 bg-neutral p-4 lg:p-8"
		>
			{#if !renaming}
				<button
					class="btn btn-ghost btn-lg text-3xl font-black normal-case leading-none lg:text-4xl"
					class:[&:not(:hover)]:opacity-70={!data.car.name}
					on:click={enableRename}>{data.car.name || '(no name)'}</button
				>
				<a
					href="/design/{data.car.shortId}"
					class="btn btn-primary rounded-box btn-lg btn-block h-20 text-4xl font-black"
					>Design</a
				>
				<div class="flex gap-4">
					<button class="btn btn-secondary font-black" on:click={copyLink}
						>Copy Link</button
					>
				</div>
			{:else}
				<form
					action="?/rename"
					method="POST"
					use:enhance={onRename}
					class="flex flex-col gap-4"
				>
					<!-- TODO: Use contenteditable="plaintext-only" ? -->
					<input
						type="text"
						name="carName"
						class="input h-16 w-full max-w-xs text-2xl"
						value={data.car.name || ''}
						placeholder="Type a name"
						maxlength={CAR_NAME_MAX_LENGTH}
						bind:this={nameInput}
					/>
					<button class="btn btn-primary btn-lg text-2xl font-bold">Save</button>
					<!-- Avoid submitting form by adding type="button" -->
					<button type="button" class="btn" on:click={() => (renaming = false)}>
						Cancel
					</button>
				</form>
			{/if}
		</div>
	{:else if data.car.name}
		<h2 class="text-4xl font-black">{data.car.name}</h2>
	{/if}
</section>
{#if data.car.totalAppearances}
	<p>seen {data.car.totalAppearances} times in {data.car.trainCount} trains</p>
	<p>last seen on {new Date(data.car.lastAppeared).toLocaleDateString()}</p>
{/if}
{#if data.user}
	<!-- Users not logged in have no page to go "back" to -->
	<!-- TODO: Add a "design your own car!" button -->
	<div class="mb-4 flex justify-center">
		<a href="/" class="btn btn-lg font-black">Back</a>
	</div>
{/if}
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
