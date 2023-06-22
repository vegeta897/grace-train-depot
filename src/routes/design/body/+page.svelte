<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { userCar } from '$lib/store'
	import { goto } from '$app/navigation'
	import type { BodyName } from 'grace-train-lib'

	const bodies: BodyName[] = ['boxy', 'tanky']

	function setBody(name: BodyName) {
		userCar.update((car) => {
			car.body = name
			return car
		})
		goto('..')
	}
</script>

<section>
	<div class="nunito mb-8 flex flex-col space-y-2">
		{#each bodies as name}
			{@const current = $userCar.body === name}
			<button
				on:click={() => setBody(name)}
				class="btn-lg btn h-32 justify-start gap-8 text-xl"
				disabled={current}
			>
				<div class="w-32"><UserCar bodyOverride={name} /></div>
				{name}
			</button>
		{/each}
	</div>
</section>
