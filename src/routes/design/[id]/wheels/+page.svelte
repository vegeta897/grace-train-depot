<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { ContainerSvg, Wheels } from 'grace-train-lib'
	import { getDesignStores } from '../../stores'
	import { WHEEL_DISTANCE_MAX, WHEEL_DISTANCE_MIN } from '$lib/common/constants'

	const { displayCar, localCars, designShortId } = getDesignStores()

	const wheelColors = [
		['#ff0000', 'rose'],
		['#00ff00', 'lime'],
		['#0000ff', 'deep'],
		['#00ffff', 'sky'],
		['#ffff00', 'sun'],
		['#ff00ff', 'pop'],
	]

	function setWheelColor(color: string) {
		localCars.update((cars) => {
			cars[$designShortId].wheels.color = color
			return cars
		})
	}

	function setWheelDistance(fromCenter: number) {
		localCars.update((cars) => {
			cars[$designShortId].wheels.fromCenter = fromCenter
			return cars
		})
	}
</script>

<section>
	<div class="mx-auto mb-6 w-64"><UserCar car={$displayCar} /></div>
	<div class="nunito mb-8 grid grid-cols-3 gap-3 lg:grid-cols-4">
		{#each wheelColors as [color, name]}
			<button
				class="btn btn-lg btn-block flex h-28 flex-col justify-center gap-2 text-xl lg:h-32 lg:gap-3"
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
		min={WHEEL_DISTANCE_MIN}
		max={WHEEL_DISTANCE_MAX}
		on:input={(e) => setWheelDistance(e.currentTarget.valueAsNumber)}
		value={$displayCar.wheels.fromCenter}
		class="range range-primary"
	/>
</section>
