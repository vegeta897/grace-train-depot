<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { getDesignStores } from '../../stores'
	import type { ActionData, PageData } from './$types'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'

	export let data: PageData
	export let form: ActionData

	const { displayCar } = getDesignStores()
</script>

<section class="flex flex-col items-center">
	<div class="w-64"><UserCar car={$displayCar} /></div>
	{#if form?.invalid}
		<div class="alert mt-4 alert-error">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="stroke-current shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			There was a problem saving your design.<br />Please refresh the page and try again.
		</div>
	{:else}
		<p class="text-lg font-bold mt-6">
			{#if $page.params.id === 'new'}
				What a cool car!
			{:else}
				Looking good!
			{/if}
		</p>
	{/if}
	{#if data.user}
		<form
			action="?/publish"
			method="POST"
			use:enhance
			class="bg-base-200 p-6 rounded-box flex flex-col mt-4 gap-2"
		>
			<input type="hidden" name="carData" value={JSON.stringify($displayCar)} />
			<button class="btn btn-primary btn-lg">Publish Car</button>
			<button
				formaction="?/save"
				class="btn btn-sm text-base-content btn-link normal-case"
				>Save without publishing</button
			>
		</form>
	{:else}
		<div class="alert mt-4">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="stroke-current shrink-0 h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/></svg
			>
			<p>
				<strong>Important!</strong> Link your Twitch account to save this car and get it on
				the tracks!
			</p>
			<p>
				<a
					href="/login?redirectTo={$page.url.pathname + $page.url.search}"
					class="nunito btn-secondary btn btn-lg">Twitch Login</a
				>
			</p>
		</div>
	{/if}
</section>
