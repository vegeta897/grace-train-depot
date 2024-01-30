<script lang="ts">
	import { getDesignStores } from '../stores'
	import type { ActionData, PageData, SubmitFunction } from './$types'
	import { page } from '$app/stores'
	import { applyAction, enhance } from '$app/forms'
	import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'
	import { browser } from '$app/environment'
	import { Car } from 'grace-train-lib/components'
	import { getCarViewBox } from '$lib/car'
	import type { DesignCar } from '$lib/server/schemas/car'
	import SignalGoals from '../SignalGoals.svelte'
	import { signalDefs } from '$lib/signals'

	export let data: PageData
	export let form: ActionData

	// TODO: AMAZING IDEA!!!!!!
	// Railway signals are applied to cars that meet certain design criteria
	// Like "mort", "poggers", "stars", "green" etc
	// Grace trains can have one (or more) of these signals, and will try to pick cars with these signals
	// Signalled grace trains can be caused by the pre-train graces
	// Analyze the cars in the initial graces to find a common signal
	// Signals have requirements, e.g. "mort" requires at least one "mort" decal
	// Give user a checklist of signals they've fulfilled, to motivate more designing
	// Show grace train signal under or above "GRACE TRAIN" block in overlay with an animated signal light
	// For emote themes, maybe treat messages containing the emote as a valid GRACE
	// Each signal should have its own unique text/bg colors
	// Leaderboards for each signal
	// Signal in db is just a string that matches definition in code
	// Move signal defs to grace-train-lib so overlay can get the colors

	const { designCar, localCars, designShortId } = getDesignStores()

	let savedCar: DesignCar
	let saveError: 'try-again' | null = null

	$: incompleteSignalGoals = $designCar.signalGoals.filter(
		(goal) => signalDefs[goal].getProgress($designCar) < 1
	)

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
					class="size-6 shrink-0 stroke-current"
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
		{:else if data.firstCar}
			<p class="text-lg">
				<strong>lovely design!</strong>
				{#if data.user}what do you call it?{/if}
			</p>
		{/if}
		{#if data.user}
			<form
				action="?/save"
				method="POST"
				use:enhance={onSave}
				class="flex flex-col gap-6"
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
						autocomplete="off"
						name="carName"
						class="input input-lg invalid:input-warning"
						value={$designCar.name}
						placeholder="enter a name here"
						maxlength={CAR_NAME_MAX_LENGTH}
					/>
				</div>
				{#if incompleteSignalGoals.length > 0}
					<div class="alert">
						<div class="w-5 text-2xl">🚦</div>
						<div>
							<p class="font-bold">you didn't meet all your signal goals</p>
							<p class="mt-1 text-base-content/70">
								but that's okay! your car is still rad
							</p>
						</div>
					</div>
				{/if}
				<button class="btn btn-primary btn-lg"> Save car </button>
			</form>
		{:else}
			<div class="alert mt-4">
				<!-- TODO: Replace with <Icon /> -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-6 shrink-0 stroke-current"
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
