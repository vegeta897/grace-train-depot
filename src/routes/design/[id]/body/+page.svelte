<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { BODY_NAMES, type BodyName } from 'grace-train-lib'
	import { getDesignStores } from '../../stores'

	const { designCar, localCars, designShortId } = getDesignStores()

	function setBody(name: BodyName) {
		localCars.update((cars) => {
			cars[$designShortId].body = name
			return cars
		})
	}
</script>

<section>
	<div class="nunito mb-8 flex flex-col space-y-2">
		{#each BODY_NAMES as name}
			{@const current = $designCar.body === name}
			<button
				class="btn btn-lg h-32 justify-start gap-8 text-xl"
				on:click={() => setBody(name)}
				disabled={current}
			>
				<div class="w-32"><UserCar car={$designCar} bodyOverride={name} /></div>
				{name}
			</button>
		{/each}
	</div>
</section>
