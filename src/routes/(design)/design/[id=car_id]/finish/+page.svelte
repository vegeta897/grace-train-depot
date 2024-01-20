<script lang="ts">
	import { getDesignStores } from '../stores'
	import type { ActionData, PageData, SubmitFunction } from './$types'
	import { page } from '$app/stores'
	import { applyAction, enhance } from '$app/forms'
	import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'
	import { browser } from '$app/environment'
	import { Car } from 'grace-train-lib/components'
	import { getCarViewBox } from '$lib/car'
	import type { CarDataWithIds } from '$lib/server/schemas/car'

	export let data: PageData
	export let form: ActionData

	const { designCar, localCars, designShortId } = getDesignStores()

	let savedCar: CarDataWithIds
	let saveError: 'try-again' | null = null

	const onSave: SubmitFunction = () => {
		saveError = null
		savedCar = $designCar
		return async ({ result }) => {
			if (result.type === 'error') {
				console.log(result.error)
				saveError = 'try-again'
			} else {
				if (result.type !== 'failure') {
					// TODO: Prevent car from flashing
					localCars.update((cars) => {
						delete cars[$designShortId]
						return cars
					})
				}
				await applyAction(result)
			}
		}
	}
</script>

<section class="flex flex-col items-center">
	<div class="w-64">
		{#if browser}<Car
				car={{ depotCar: savedCar || $designCar }}
				viewBox={getCarViewBox($designCar)}
			/>{/if}
	</div>
	{#if form?.invalid || saveError === 'try-again'}
		<div class="alert alert-error mt-4 w-auto">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			there was a problem saving your design.<br />please refresh the page and try again.
		</div>
	{:else}
		<p class="mt-6 text-lg font-bold">
			{#if $page.params.id === 'new'}
				what a cool car!
			{:else}
				looking good!
			{/if}
		</p>
	{/if}
	{#if data.user}
		<form
			action="?/publish"
			method="POST"
			use:enhance={onSave}
			class="rounded-box mt-4 flex flex-col gap-3 bg-neutral p-6"
		>
			<input type="hidden" name="carData" value={JSON.stringify($designCar)} />
			<div class="form-control w-full max-w-xs">
				<label for="carName" class="label">
					<span class="label-text">car name</span>
					<span class="label-text-alt opacity-70">required</span>
				</label>
				<input
					required
					type="text"
					name="carName"
					class="input w-full max-w-xs invalid:input-warning"
					value={$designCar.name}
					placeholder="type here"
					maxlength={CAR_NAME_MAX_LENGTH}
				/>
			</div>
			<button class="btn btn-primary btn-lg">
				{#if $designCar.published}Save{:else}Publish{/if} Car
			</button>
			<div class="divider my-1">or</div>
			<button formaction="?/save" class="link"
				>save {#if $designCar.published}and move to drafts{:else}without publishing{/if}</button
			>
		</form>
	{:else}
		<div class="alert mt-4">
			<!-- TODO: Replace with <Icon /> -->
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
			<p>link your Twitch account to save this car and get it on the tracks!</p>
			<p>
				<a
					href="/login?redirectTo={$page.url.pathname + $page.url.search}"
					class="btn btn-secondary btn-lg">Twitch Login</a
				>
			</p>
		</div>
	{/if}
</section>
