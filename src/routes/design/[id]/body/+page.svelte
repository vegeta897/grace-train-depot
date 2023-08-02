<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { BODY_NAMES } from 'grace-train-lib'
	import type { PageData, ActionData } from './$types'
	import { enhance } from '$app/forms'

	export let data: PageData
	export let form: ActionData

	$: if (form?.body) data.car.body = form.body

	// TODO: Defer saving for a faster UX
	// Maybe use a localstorage-synced svelte store to store user car
	// Create a module to handle all updates to user car
	// Send changed properties to server
	// Export saved/unsaved status (make a component?) to display on design pages
	// Or just add to /design/+layout.svelte
</script>

<section>
	<div class="nunito mb-8 flex flex-col space-y-2">
		{#each BODY_NAMES as name}
			{@const current = data.car.body === name}
			<form method="POST" use:enhance>
				<input type="hidden" name="body" value={name} />
				<button class="btn-lg btn h-32 justify-start gap-8 text-xl" disabled={current}>
					<div class="w-32"><UserCar car={data.car} bodyOverride={name} /></div>
					{name}
				</button>
			</form>
		{/each}
	</div>
</section>
