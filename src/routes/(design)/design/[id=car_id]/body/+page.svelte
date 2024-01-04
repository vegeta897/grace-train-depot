<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { BODY_NAMES, Car, type BodyName } from 'grace-train-lib/components'
	import { getDesignStores } from '../stores'
	import ColorSlider from '../ColorSlider.svelte'
	import { COLORS, COLOR_NAMES } from 'grace-train-lib'
	import type { CarData } from '$lib/server/schemas'
	import { browser } from '$app/environment'

	const { designCar, localCars, designShortId } = getDesignStores()

	function setBody(name: BodyName) {
		localCars.update((cars) => {
			cars[$designShortId].body = name
			return cars
		})
	}

	function setBodyColor(color: string) {
		localCars.update((cars) => {
			cars[$designShortId].bodyColor = color as CarData['bodyColor']
			return cars
		})
	}

	function setBodyPopColor(color: string) {
		localCars.update((cars) => {
			cars[$designShortId].bodyPopColor = color as CarData['bodyPopColor']
			return cars
		})
	}
</script>

<section
	class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row lg:items-start"
>
	<div class="p-4 lg:w-1/2 lg:p-6">
		{#if browser}<DesignCar car={$designCar} />{/if}
	</div>
	<div class="rounded-box space-y-4 bg-neutral px-6 py-5 lg:w-1/2">
		<div class="rounded-box flex items-start gap-2 bg-base-200 p-2 sm:gap-0 sm:p-4">
			<div class="grid grow grid-cols-[repeat(auto-fill,_minmax(6rem,_1fr))] gap-2">
				{#each BODY_NAMES as name}
					{@const current = $designCar.body === name}
					<button
						on:click={() => setBody(name)}
						class="btn btn-ghost h-auto min-h-full w-full touch-manipulation px-2 py-2 outline-2 outline-white"
						class:outline={current}
					>
						<DesignCar
							car={$designCar}
							bodyOverride={name}
							cropToCar
							toppersOverride={[]}
						/>
					</button>
				{/each}
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<h3 class="text-xl">base color</h3>
			<ColorSlider
				colors={COLORS.BASE}
				color={$designCar.bodyColor || COLOR_NAMES.BASE.BASE}
				onInput={setBodyColor}
			/>
			<h3 class="mt-2 text-xl">pop color</h3>
			<ColorSlider
				colors={COLORS.POP}
				color={$designCar.bodyPopColor || COLOR_NAMES.POP.POP}
				onInput={setBodyPopColor}
			/>
		</div>
	</div>
</section>
