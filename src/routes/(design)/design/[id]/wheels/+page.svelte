<script lang="ts">
	import Car from '$lib/components/Car.svelte'
	import { getDesignStores } from '../../stores'
	import {
		POP_COLORS,
		WHEEL_DISTANCE_MAX,
		WHEEL_DISTANCE_MIN,
	} from '$lib/common/constants'
	import ColorSlider from '../../ColorSlider.svelte'

	const { designCar, localCars, designShortId } = getDesignStores()

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
	<div class="mx-auto mb-6 w-64"><Car car={$designCar} /></div>
	<div class="rounded-box flex flex-col gap-3 bg-neutral px-6 py-5">
		<h3 class="nunito text-2xl uppercase">Color</h3>
		<div class="mb-6 flex flex-col justify-center gap-3">
			<ColorSlider
				colors={POP_COLORS}
				color={$designCar.wheels.color || POP_COLORS[1]}
				onInput={(e) => setWheelColor(POP_COLORS[+e.currentTarget.value])}
			/>
		</div>
		<h3 class="nunito text-2xl uppercase">Spread</h3>
		<input
			type="range"
			min={WHEEL_DISTANCE_MIN}
			max={WHEEL_DISTANCE_MAX}
			on:input={(e) => setWheelDistance(e.currentTarget.valueAsNumber)}
			value={$designCar.wheels.fromCenter}
			class="range range-primary"
		/>
	</div>
</section>
