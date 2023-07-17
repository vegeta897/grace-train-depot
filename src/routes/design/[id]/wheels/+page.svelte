<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { ContainerSvg, Wheels } from 'grace-train-lib'
	import type { PageData } from './$types'

	export let data: PageData

	const wheels = [
		['#ff0000', 'rose'],
		['#00ff00', 'lime'],
		['#0000ff', 'deep'],
		['#00ffff', 'sky'],
		['#ffff00', 'sun'],
		['#ff00ff', 'pop'],
	]
</script>

<section>
	<div class="mx-auto my-6 w-64"><UserCar car={data.car} /></div>
	<div class="nunito mb-8 grid grid-cols-3 gap-3 lg:grid-cols-4">
		{#each wheels as [color, name]}
			<button
				class="btn-block btn-lg btn flex h-28 flex-col justify-center gap-2 text-xl lg:h-32 lg:gap-3"
				on:click={() => (data.car.wheels.color = color)}
			>
				<ContainerSvg class="h-10 w-10" viewBox="150 225 75 75">
					<Wheels rimColor={color} fromCenter={0} />
				</ContainerSvg>
				{name}
			</button>
		{/each}
	</div>
	<h3 class="nunito mb-4 text-2xl uppercase">Spread</h3>
	<input
		type="range"
		min="80"
		max="115"
		bind:value={data.car.wheels.fromCenter}
		class="range range-primary"
	/>
</section>
