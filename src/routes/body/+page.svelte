<script lang="ts">
	import { userCar } from '$lib/store'
	import { goto } from '$app/navigation'
	import { BODY, type BodyType } from '$lib/body'

	function setBody(name: BodyType) {
		userCar.update((car) => {
			car.body = name
			return car
		})
		goto('..')
	}
</script>

<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Body</h1>
	<div class="nunito mb-8 flex flex-col space-y-2">
		{#each BODY as { name, component }}
			{@const current = $userCar.body === name}
			<button
				on:click={() => setBody(name)}
				class="btn-lg btn h-32 justify-start gap-8 text-xl"
				disabled={current}
			>
				<div class="w-32"><svelte:component this={component} /></div>
				{name}
			</button>
		{/each}
	</div>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
