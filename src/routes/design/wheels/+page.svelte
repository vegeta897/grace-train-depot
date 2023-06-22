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
			car.wheelColor = color
			return car
		})
	}
</script>

<section>
	<div class="mx-auto my-6 w-64"><UserCar /></div>
	<div class="nunito mb-8 grid grid-flow-row grid-cols-2 gap-3">
		{#each wheels as [color, name]}
			<button
				class="btn-block btn-lg btn justify-start gap-4 text-xl"
				on:click={() => setWheelColor(color)}
			>
				<ContainerSvg class="h-10 w-10" viewBox="150 225 75 75">
					<Wheels rimColor={color} fromCenter={0} />
				</ContainerSvg>
				{name}
			</button>
		{/each}
	</div>
	Set carriage height:
</section>
