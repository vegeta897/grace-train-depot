<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { Car, ContainerSvg } from 'grace-train-lib/components'
	import { getDesignStores } from '../stores'
	import ColorSlider from '../ColorSlider.svelte'
	import { COLORS, COLOR_NAMES } from 'grace-train-lib'
	import { browser } from '$app/environment'
	import { getCarViewBox } from '$lib/car'
	import BoundingBox from '$lib/components/BoundingBox.svelte'
	import { BODY_NAMES, type BodyName } from 'grace-train-lib/data'

	const { designCar, updateDesignCar } = getDesignStores()

	function setBody(name: BodyName) {
		updateDesignCar((car) => {
			car.body = name
		})
	}

	function setBodyColor(color: string) {
		updateDesignCar((car) => {
			car.bodyColor = color
		})
	}

	function setBodyPopColor(color: string) {
		updateDesignCar((car) => {
			car.bodyPopColor = color
		})
	}
</script>

<section class="flex w-full flex-col items-center gap-1 xs:gap-3 lg:flex-row">
	<div class="p-4 lg:w-1/2 lg:p-6">
		{#if browser}<Car
				car={{ depotCar: $designCar }}
				viewBox={getCarViewBox($designCar)}
			/>{/if}
	</div>
	<div class="rounded-box w-full space-y-4 bg-neutral p-4 lg:w-1/2 lg:p-5">
		<div class="rounded-box flex items-start gap-2 bg-base-100 p-2 sm:gap-0 sm:p-4">
			<div class="grid grow grid-cols-[repeat(auto-fill,_minmax(6rem,_1fr))] gap-2">
				{#each BODY_NAMES as name}
					{@const current = $designCar.body === name}
					<button
						on:click={() => setBody(name)}
						class="btn btn-ghost relative h-auto w-full touch-manipulation px-2 py-2"
					>
						<DesignCar
							car={$designCar}
							bodyOverride={name}
							cropToCar
							toppersOverride={[]}
						/>
						{#if current}
							<ContainerSvg viewBox="0 0 250 200" position="absolute">
								<BoundingBox
									width={250}
									height={200}
									strokeWidthScale={1.5}
									centered={false}
								/>
							</ContainerSvg>
						{/if}
					</button>
				{/each}
			</div>
		</div>
		<div class="grid grid-cols-[max-content_auto] items-center gap-x-3 gap-y-4">
			<label for="popColor" class="text-lg text-base-content/80 lg:text-xl"
				>pop color</label
			>
			<ColorSlider
				id="popColor"
				colors={COLORS.POP}
				color={$designCar.bodyPopColor || COLOR_NAMES.POP.POP}
				onInput={setBodyPopColor}
			/>
			<label for="baseColor" class="text-lg text-base-content/80 lg:text-xl"
				>base color</label
			>
			<ColorSlider
				id="baseColor"
				colors={COLORS.BASE}
				color={$designCar.bodyColor || COLOR_NAMES.BASE.BASE}
				onInput={setBodyColor}
			/>
		</div>
	</div>
</section>
