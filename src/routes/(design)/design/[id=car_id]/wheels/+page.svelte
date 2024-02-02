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
	import { browser } from '$app/environment'
	import { getCarViewBox } from '$lib/car'

	const { designCar, updateDesignCar } = getDesignStores()

	function setColor(prop: 'wheelBaseColor' | 'wheelPopColor', color: string) {
		updateDesignCar((car) => {
			car[prop] = color
		})
	}

	function setFlipColors(flip: boolean) {
		updateDesignCar((car) => {
			car.wheelFlipColors = flip
		})
	}

	function setWheelDistance(fromCenter: number) {
		updateDesignCar((car) => {
			car.wheelFromCenter = fromCenter
		})
	}

	function setWheelSize(size: number) {
		updateDesignCar((car) => {
			car.wheelSize = size
		})
	}
</script>

<section class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row">
	<div class="p-4 lg:w-1/2 lg:p-6">
		{#if browser}<DesignCar car={$designCar} viewBox={getCarViewBox($designCar)} />{/if}
	</div>
	<div
		class="rounded-box grid w-full grid-cols-[min-content_auto] items-center gap-x-3 gap-y-4 bg-neutral p-4 lg:w-1/2 lg:p-5"
	>
		<label for="popColor" class="text-lg lg:text-xl">pop color</label>
		<ColorSlider
			id="popColor"
			colors={COLORS.POP}
			color={$designCar.wheelPopColor || COLOR_NAMES.POP.POP}
			onInput={(color) => setColor('wheelPopColor', color)}
		/>
		<label for="baseColor" class="text-lg lg:text-xl">base color</label>
		<ColorSlider
			id="baseColor"
			colors={COLORS.BASE}
			color={$designCar.wheelBaseColor || COLOR_NAMES.BASE.BASE}
			onInput={(color) => setColor('wheelBaseColor', color)}
		/>
		<label for="flipColors" class="text-lg lg:text-xl">flip colors</label>
		<input
			id="flipColors"
			type="checkbox"
			on:change={(e) => setFlipColors(e.currentTarget.checked)}
			value={$designCar.wheelFlipColors}
			class="toggle"
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
		<label for="wheelDistance" class="text-lg lg:text-xl">wheelbase</label>
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
</section>
