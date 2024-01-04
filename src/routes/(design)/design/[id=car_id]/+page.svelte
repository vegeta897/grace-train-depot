<script lang="ts">
	// import type { PageData } from './$types'
	import { getDesignStores } from './stores'
	import { enhance } from '$app/forms'
	import { browser } from '$app/environment'
	import { Car } from 'grace-train-lib/components'

	// export let data: PageData

	const { designCar, designShortId } = getDesignStores()

	let deleteMode = false
</script>

<section class="flex flex-col items-center gap-4">
	{#if browser}
		<div class="w-48 lg:w-64"><Car car={$designCar} viewBox="0 -60 375 360" /></div>
		<h3 class="flex items-center gap-2 text-3xl font-black">
			{#if $designCar.name}<span>{$designCar.name}</span>{/if}
			<span
				class="badge badge-lg"
				class:badge-primary={$designCar.published}
				class:badge-warning={!$designCar.published}
			>
				{#if $designCar.published}live{:else}draft{/if}
			</span>
		</h3>
	{/if}
	<div class="rounded-box flex flex-col items-center gap-4 bg-neutral p-6">
		{#if $designShortId === 'new'}
			<p class="text-xl">let's design a Grace Train car!</p>
			<p>start with the basics:</p>
			<a class="btn btn-lg font-black" href="/design/{$designShortId}/body"
				><span class="relative top-[-3px] text-2xl">🚌</span> Pick a Body</a
			>
		{:else}
			<!-- TODO: Suggest a page based on existing design -->
			<p class="text-xl">how about a new set of wheels?</p>
			<a
				class="btn btn-lg font-black tracking-wide"
				href="/design/{$designShortId}/wheels"
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
					<span>are you sure you want to delete this car? this cannot be undone!</span>
				</div>
				<div class="flex gap-4">
					<button
						class="btn font-black tracking-wide"
						on:click={() => (deleteMode = false)}>Cancel</button
					>
					<form action="?/delete" method="POST" use:enhance>
						<button class="btn font-black tracking-wide hover:btn-error"
							>🗑️ Delete it!</button
						>
					</form>
				</div>
			{:else}
				<button
					class="btn btn-error font-black tracking-wide"
					on:click={() => (deleteMode = true)}>Delete Car</button
				>
			{/if}
		{/if}
	</div>
</section>
