<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import type { BodyName } from 'grace-train-lib'
	import type { PageData, ActionData } from './$types'
	import { enhance } from '$app/forms'

	export let data: PageData
	export let form: ActionData

	$: if (form?.body) data.car.body = form.body

	const bodies: BodyName[] = ['boxy', 'tanky']
</script>

<section>
	<div class="nunito mb-8 flex flex-col space-y-2">
		{#each bodies as name}
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
