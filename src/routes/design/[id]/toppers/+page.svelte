<script lang="ts">
	import Car from '$lib/components/Car.svelte'
	import { ContainerSvg, TOPPER_NAMES, Topper, type TopperName } from 'grace-train-lib'
	import { getDesignStores } from '../../stores'

	// TODO: Use "indicator" daisyUI class to indicate new/unique items

	const { designCar, localCars, designShortId } = getDesignStores()

	function setTopper(name: TopperName) {
		// data.car.hat.color = color
		// updateCar(data.car.id, { hat: { color } })
		localCars.update((cars) => {
			cars[$designShortId].toppers[0] = {
				name,
				id: Date.now(), // Local only, will be overwritten after saving to server
				colors: ['#79f800', '#00adf8'],
				position: 2,
				new: true,
			}
			return cars
		})
	}
</script>

<section>
	<div class="mx-auto mb-6 w-64"><Car car={$designCar} /></div>
	<div class="nunito mb-8 grid grid-cols-3 gap-3 lg:grid-cols-4">
		{#each TOPPER_NAMES as name}
			<button
				class="btn btn-block flex h-28 flex-col justify-center gap-2 text-xl lg:h-32 lg:gap-4"
				on:click={() => setTopper(name)}
			>
				<ContainerSvg class="h-10 w-10" viewBox="0 0 100 100">
					<Topper {name} position={[40, 100]} colors={['#79f800', '#00adf8']} />
				</ContainerSvg>
				{name}
			</button>
		{/each}
	</div>
</section>
