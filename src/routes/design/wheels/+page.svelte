<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { userCar } from '$lib/store'
	import { ContainerSvg, Wheels } from 'grace-train-lib'

	const wheels = [
		['#ff0000', 'rose'],
		['#00ff00', 'lime'],
		['#0000ff', 'deep'],
		['#00ffff', 'sky'],
		['#ffff00', 'sun'],
		['#ff00ff', 'pop'],
	]

	function setWheelColor(color: string) {
		userCar.update((car) => {
			car.wheels.color = color
			return car
		})
	}
</script>

<section>
	<div class="mx-auto my-6 w-64"><UserCar /></div>
	<div class="nunito mb-8 grid grid-cols-3 gap-3 lg:grid-cols-4">
		{#each wheels as [color, name]}
			<button
				class="btn-block btn-lg btn flex h-28 flex-col justify-center gap-2 text-xl lg:h-32 lg:gap-3"
				on:click={() => setWheelColor(color)}
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
		bind:value={$userCar.wheels.fromCenter}
		class="range range-primary"
	/>
</section>
