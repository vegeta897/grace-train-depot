<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { BODY_NAMES, type BodyName } from 'grace-train-lib/components'
	import { getDesignStores } from '../../stores'
	import ColorSlider from '../../ColorSlider.svelte'
	import { COLORS } from 'grace-train-lib'
	import type { CarData } from '$lib/server/schemas'

	const { designCar, localCars, designShortId } = getDesignStores()

	function setBody(name: BodyName) {
		localCars.update((cars) => {
			cars[$designShortId].body = name
			return cars
		})
	}

	function setBodyColor(color: CarData['bodyColor']) {
		localCars.update((cars) => {
			cars[$designShortId].bodyColor = color
			return cars
		})
	}

	function setBodyPopColor(color: CarData['bodyPopColor']) {
		localCars.update((cars) => {
			cars[$designShortId].bodyPopColor = color
			return cars
		})
	}
</script>

<section>
	<div class="grid grid-cols-2 gap-4 font-black">
		{#each BODY_NAMES as name}
			{@const current = $designCar.body === name}
			<button
				class="btn btn-block h-40"
				on:click={() => setBody(name)}
				disabled={current}
			>
				<div class="w-32"><DesignCar car={$designCar} bodyOverride={name} /></div>
			</button>
		{/each}
	</div>
	<div class="rounded-box flex flex-col gap-3 bg-neutral px-6 py-5">
		<h3 class="text-2xl font-black uppercase">Base Color</h3>
		TODO: Allow granular color selection using mix function in color2k
		<ColorSlider
			colors={COLORS.BASE}
			color={$designCar.bodyColor || COLORS.BASE[3]}
			onInput={(e) => setBodyColor(COLORS.BASE[+e.currentTarget.value])}
		/>
		<h3 class="mt-2 text-2xl font-black uppercase">Pop Color</h3>
		<ColorSlider
			colors={COLORS.POP}
			color={$designCar.bodyPopColor || COLORS.POP[1]}
			onInput={(e) => setBodyPopColor(COLORS.POP[+e.currentTarget.value])}
		/>
	</div>
</section>
