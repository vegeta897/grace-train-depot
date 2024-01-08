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
	import { COLORS, COLOR_NAMES } from 'grace-train-lib'
	import type { CarData } from '$lib/server/schemas'
	import { browser } from '$app/environment'
	import { getCarViewBox } from '$lib/car'

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

<section class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row">
	<div class="p-4 lg:w-1/2 lg:p-6">
		{#if browser}<DesignCar car={$designCar} viewBox={getCarViewBox($designCar)} />{/if}
	</div>
	<div class="rounded-box w-full bg-neutral p-4 lg:w-1/2 lg:p-5">
		<div class="grid grid-cols-[min-content_auto] items-center gap-x-3 gap-y-4">
			<label for="color" class="text-lg lg:text-xl">color</label>
			<ColorSlider
				id="color"
				colors={COLORS.POP}
				color={$designCar.wheelColor || COLOR_NAMES.POP.POP}
				onInput={setWheelColor}
			/>
			<label for="wheelSize" class="text-lg lg:text-xl">size</label>
			<input
				id="wheelSize"
				type="range"
				min={WHEEL_SIZE_MIN}
				max={WHEEL_SIZE_MAX}
				on:input={(e) => setWheelSize(e.currentTarget.valueAsNumber)}
				value={$designCar.wheelSize}
				class="range"
			/>
			<label for="wheelDistance" class="text-lg lg:text-xl">spread</label>
			<input
				id="wheelDistance"
				type="range"
				min={WHEEL_DISTANCE_MIN}
				max={WHEEL_DISTANCE_MAX}
				on:input={(e) => setWheelDistance(e.currentTarget.valueAsNumber)}
				value={$designCar.wheelFromCenter}
				class="range"
			/>
		</div>
	</div>
</section>
