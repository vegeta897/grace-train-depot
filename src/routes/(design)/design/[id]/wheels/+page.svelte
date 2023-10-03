<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { getDesignStores } from '../../stores'
	import { WHEEL_DISTANCE_MAX, WHEEL_DISTANCE_MIN } from '$lib/common/constants'
	import ColorSlider from '../../ColorSlider.svelte'
	import { COLORS } from 'grace-train-lib'

	const { designCar, localCars, designShortId } = getDesignStores()

	function setWheelColor(color: string) {
		localCars.update((cars) => {
			cars[$designShortId].wheelColor = color
			return cars
		})
	}

	function setWheelDistance(fromCenter: number) {
		localCars.update((cars) => {
			cars[$designShortId].wheelFromCenter = fromCenter
			return cars
		})
	}
</script>

<section>
	<div class="mx-auto mb-6 w-64"><DesignCar car={$designCar} /></div>
	<div class="rounded-box flex flex-col gap-3 bg-neutral px-6 py-5">
		<h3 class="text-2xl font-black uppercase">Color</h3>
		<ColorSlider
			colors={COLORS.POP}
			color={$designCar.wheelColor || COLORS.POP[1]}
			onInput={(e) => setWheelColor(COLORS.POP[+e.currentTarget.value])}
		/>
		<h3 class="mt-2 text-2xl font-black uppercase">Spread</h3>
		<input
			type="range"
			min={WHEEL_DISTANCE_MIN}
			max={WHEEL_DISTANCE_MAX}
			on:input={(e) => setWheelDistance(e.currentTarget.valueAsNumber)}
			value={$designCar.wheelFromCenter}
			class="range range-primary"
		/>
	</div>
</section>
