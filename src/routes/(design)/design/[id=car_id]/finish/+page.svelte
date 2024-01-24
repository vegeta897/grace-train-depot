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

	// TODO: AMAZING IDEA!!!!!!
	// Allow users to tag their cars with one or more preset tags
	// Like "mort", "poggers", "stars", "green" etc
	// Grace trains can have one (or more) of these tags, and will try to pick cars with this tag
	// Tags have requirements, e.g. "mort" requires at least one "mort" decal
	// Show car tags on car page
	// Give user a checklist of tags they've fulfilled, to motivate more designing
	// Show grace train theme under or above "GRACE TRAIN" block in overlay
	// For emote themes, maybe treat messages containing the emote as a valid GRACE
	// Each tag should have its own unique text/bg colors
	// Leaderboards for each ticket
	// Create table for many-to-many ticket/car relation records
	// Ticket in db is just a string that matches definition in code
	// Move ticket defs to grace-train-lib so spice bot can use them for grace trains

	const { designCar, localCars, designShortId } = getDesignStores()

	let savedCar: CarDataWithIds
	let saveError: 'try-again' | null = null
	let saveAsDraft = $designCar.published === false

	const onSave: SubmitFunction = () => {
		saveError = null
		savedCar = $designCar
		return async ({ result }) => {
			if (result.type === 'error') {
				console.log(result.error)
				saveError = 'try-again'
			} else {
				if (result.type !== 'failure') {
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

<section class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row">
	<div class="flex flex-col items-center lg:w-1/2">
		<div class="p-4 lg:p-6">
			{#if browser}
				<Car
					car={{ depotCar: savedCar || $designCar }}
					viewBox={getCarViewBox($designCar)}
				/>
			{/if}
		</div>
	</div>
	<div class="rounded-box w-full space-y-4 bg-neutral p-6 xs:px-10 xs:py-8 lg:w-1/2">
		{#if form?.invalid || saveError === 'try-again'}
			<div class="alert alert-error mt-4 w-auto">
				<!-- TODO: Move to Icon.svelte -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				there was a problem saving your design.<br />please refresh the page and try
				again.
			</div>
		{:else if $page.params.id === 'new' && data.user}
			<p class="text-lg"><strong>lovely design!</strong> what do you call it?</p>
		{/if}
		{#if data.user}
			<form
				action="?/save"
				method="POST"
				use:enhance={onSave}
				class="flex flex-col gap-4"
			>
				<input type="hidden" name="carData" value={JSON.stringify($designCar)} />
				<div class="form-control">
					<label for="carName" class="label">
						<span class="label-text text-base">car name</span>
						<span class="text-base text-base-content/50">required</span>
					</label>
					<input
						required
						type="text"
						name="carName"
						class="input input-lg invalid:input-warning"
						value={$designCar.name}
						placeholder="type a name here"
						maxlength={CAR_NAME_MAX_LENGTH}
					/>
				</div>
				<label class="label cursor-pointer">
					<div>
						<p class="label-text text-lg">save as a draft</p>
						<p class="label-text text-base-content/70">
							drafts won't appear in grace trains
						</p>
					</div>
					<input
						type="checkbox"
						name="draft"
						class="checkbox checkbox-lg"
						bind:checked={saveAsDraft}
						value="draft"
					/>
				</label>
				<button class="btn btn-primary btn-lg">
					{#if saveAsDraft}
						Save draft
					{:else if $designCar.published === false}
						Save &amp; activate
					{:else}
						Save car
					{/if}
				</button>
				<!-- <div class="divider my-1">or</div>
				<button formaction="?/save" class="link text-lg"
					>save {#if $designCar.published}and move to drafts{:else}without publishing{/if}</button
				> -->
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
	</div>
</section>
