<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { getDesignStores } from '../stores'
	import {
		WHEEL_DISTANCE_MAX,
		WHEEL_DISTANCE_MIN,
		WHEEL_SIZE_MAX,
		WHEEL_SIZE_MIN,
	} from '$lib/common/constants'
	import ColorSlider from '../ColorSlider.svelte'
	import { COLORS } from 'grace-train-lib'
	import type { CarData } from '$lib/server/schemas'
	import { browser } from '$app/environment'

	const { designCar, localCars, designShortId } = getDesignStores()

	function setWheelColor(color: string) {
		localCars.update((cars) => {
			cars[$designShortId].wheelColor = color as CarData['wheelColor']
			return cars
		})
	}

	function setWheelDistance(fromCenter: number) {
		localCars.update((cars) => {
			cars[$designShortId].wheelFromCenter = fromCenter
			return cars
		})
	}

	function setWheelSize(size: number) {
		localCars.update((cars) => {
			cars[$designShortId].wheelSize = size
			return cars
		})
	}
</script>

<section>
	<div class="mx-auto mb-6 w-64">
		{#if browser}<DesignCar car={$designCar} />{/if}
	</div>
	<div class="rounded-box flex flex-col gap-3 bg-neutral px-6 py-5">
		<h3 class="text-2xl font-black uppercase tracking-wide">Color</h3>
		<ColorSlider
			colors={COLORS.POP}
			color={$designCar.wheelColor || COLORS.POP[1]}
			onInput={setWheelColor}
		/>
		<h3 class="mt-2 text-2xl font-black uppercase tracking-wide">Spread</h3>
		<input
			type="range"
			min={WHEEL_DISTANCE_MIN}
			max={WHEEL_DISTANCE_MAX}
			on:input={(e) => setWheelDistance(e.currentTarget.valueAsNumber)}
			value={$designCar.wheelFromCenter}
			class="range range-primary"
		/>
		<h3 class="mt-2 text-2xl font-black uppercase tracking-wide">Size</h3>
		<input
			type="range"
			min={WHEEL_SIZE_MIN}
			max={WHEEL_SIZE_MAX}
			on:input={(e) => setWheelSize(e.currentTarget.valueAsNumber)}
			value={$designCar.wheelSize}
			class="range range-primary"
		/>
	</div>
</section>
