<script lang="ts">
	import Car from '$lib/components/Car.svelte'
	import type { PageData } from './$types'
	import { getDesignStores } from '../stores'
	import { enhance } from '$app/forms'

	export let data: PageData

	const { designCar, designShortId } = getDesignStores()

	let deleteMode = false
</script>

<section class="flex flex-col items-center gap-4">
	<div class="w-48 lg:w-64"><Car car={$designCar} /></div>
	{#if !data.user}
		<!-- <div class="alert mt-8">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-info shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path></svg
			>
			<p class="text-sm lg:text-base">
				<a href="/login" class="link font-bold">Link your Twitch account</a> to appear in Grace
				Trains! You may do this at any time.
			</p>
		</div> -->
	{/if}
	<h3 class="flex items-center gap-2 text-3xl font-black font-bold">
		{#if $designCar.name}<span>{$designCar.name}</span>{/if}
		<span
			class="badge uppercase"
			class:badge-primary={$designCar.published}
			class:badge-warning={!$designCar.published}
		>
			{#if $designCar.published}Live{:else}Draft{/if}
		</span>
	</h3>
	<div class="rounded-box flex flex-col items-center gap-4 bg-neutral p-6">
		{#if $designShortId === 'new'}
			<p class="text-xl">Let's design a Grace Train car!</p>
			<p>Start with the basics:</p>
			<a class="btn btn-lg" href="/design/{$designShortId}/body"
				><span class="relative top-[-3px] text-2xl">🚌</span> Pick a Body</a
			>
		{:else}
			<!-- TODO: Suggest a page based on existing design -->
			<p class="text-xl">How about a new set of wheels?</p>
			<a class="btn btn-lg" href="/design/{$designShortId}/wheels"
				><span class="relative text-2xl">🎡</span> Wheels</a
			>
			<div class="divider my-0"></div>
			{#if deleteMode}
				<div class="alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/></svg
					>
					<span>Are you sure you want to delete this car? This cannot be undone!</span>
				</div>
				<div class="flex gap-4">
					<button class="btn" on:click={() => (deleteMode = false)}>Cancel</button>
					<form action="?/delete" method="POST" use:enhance>
						<button class="btn hover:btn-error">🗑️ Delete it!</button>
					</form>
				</div>
			{:else}
				<button class="btn btn-error" on:click={() => (deleteMode = true)}
					>Delete Car</button
				>
			{/if}
		{/if}
	</div>
	<pre class="rounded-box mt-2 bg-base-300 p-2 text-xs">{JSON.stringify(
			data,
			null,
			2
		)}</pre>
</section>
