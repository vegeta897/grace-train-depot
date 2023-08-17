<script lang="ts">
	import Car from '$lib/components/Car.svelte'
	import { ContainerSvg, TOPPER_NAMES, Topper, type TopperName } from 'grace-train-lib'
	import { getDesignStores } from '../../stores'
	import type { TopperDataWithId } from '$lib/schemas'

	// TODO: Use "indicator" daisyUI class to indicate new/unique items

	const { designCar, localCars, designShortId } = getDesignStores()

	function setTopper(slot: number, name: TopperName) {
		localCars.update((cars) => {
			cars[$designShortId].toppers[0] = {
				name,
				id: Date.now(),
				slot,
				colors: ['#79f800', '#00adf8'],
				position: [0.2, 0.5, 0.8][slot], // Ehh
				offset: 0,
				scale: 1,
				rotate: 0,
			}
			return cars
		})
	}

	function setTopperProp<K extends keyof TopperDataWithId>(
		slot: number,
		prop: K,
		value: TopperDataWithId[K]
	) {
		localCars.update((cars) => {
			cars[$designShortId].toppers[slot][prop] = value
			return cars
		})
	}
</script>

<section>
	<div class="mx-auto mb-6 w-64"><Car car={$designCar} /></div>
	<div class="nunito mb-4 grid grid-cols-3 gap-3 lg:grid-cols-4">
		{#each TOPPER_NAMES as name}
			<button
				class="btn btn-block flex h-24 flex-col justify-center gap-2 text-xl normal-case lg:h-28 lg:gap-4"
				on:click={() => setTopper(0, name)}
			>
				<ContainerSvg class="h-8 w-8" viewBox="-50 -120 100 100">
					<Topper
						{name}
						topLine={[[0, 0]]}
						position={0}
						colors={['#79f800', '#00adf8']}
					/>
				</ContainerSvg>
				{name}
			</button>
		{/each}
	</div>
	{#if $designCar.toppers[0]}
		<div class="grid grid-cols-1 gap-x-8 gap-y-2 lg:grid-cols-2">
			<div class="form-control">
				<label for="topperPosition" class="label">
					<span class="label-text">Place</span>
				</label>
				<input
					name="topperPosition"
					type="range"
					min={0}
					max={1}
					step={1 / 400}
					value={$designCar.toppers[0].position}
					on:input={(e) => setTopperProp(0, 'position', +e.currentTarget.value)}
					class="range"
				/>
			</div>
			<div class="form-control">
				<label for="topperOffset" class="label">
					<span class="label-text">Offset</span>
				</label>
				<input
					name="topperOffset"
					type="range"
					min={-20}
					max={20}
					step="1"
					value={$designCar.toppers[0].offset}
					on:input={(e) => setTopperProp(0, 'offset', +e.currentTarget.value)}
					class="range"
				/>
			</div>
			<div class="form-control">
				<label for="topperRotate" class="label">
					<span class="label-text">Tilt</span>
				</label>
				<input
					name="topperRotate"
					type="range"
					min={-25}
					max={25}
					step="1"
					value={$designCar.toppers[0].rotate}
					on:input={(e) => setTopperProp(0, 'rotate', +e.currentTarget.value)}
					class="range range-secondary"
				/>
			</div>
			<div class="form-control">
				<label for="topperScale" class="label">
					<span class="label-text">Scale</span>
				</label>
				<input
					name="topperScale"
					type="range"
					min={0.5}
					max={1.5}
					step="0.01"
					value={$designCar.toppers[0].scale}
					on:input={(e) => setTopperProp(0, 'scale', +e.currentTarget.value)}
					class="range range-primary"
				/>
			</div>
		</div>
	{/if}
</section>
