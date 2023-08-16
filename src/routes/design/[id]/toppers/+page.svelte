<script lang="ts">
	import Car from '$lib/components/Car.svelte'
	import { ContainerSvg, TOPPER_NAMES, Topper, type TopperName } from 'grace-train-lib'
	import { getDesignStores } from '../../stores'
	import type { TopperData } from '$lib/schemas'

	// TODO: Use "indicator" daisyUI class to indicate new/unique items

	const { designCar, localCars, designShortId } = getDesignStores()

	function setTopper(name: TopperName) {
		// data.car.hat.color = color
		// updateCar(data.car.id, { hat: { color } })
		localCars.update((cars) => {
			cars[$designShortId].toppers[0] = {
				name,
				colors: ['#79f800', '#00adf8'],
				position: 2,
				new: true,
				adjust: { x: 0, y: 0, rotate: 0, scale: 1 },
			}
			return cars
		})
	}

	const axes = ['x', 'y'] as const

	// TODO: Maybe implement position as a LERP between the position points
	// Can remove x from adjust, rename y to offset
	// Add slot numbers like with decals

	function positionTopper(topperIndex: number, positionNumber: number) {
		localCars.update((cars) => {
			cars[$designShortId].toppers[topperIndex].position = positionNumber
			return cars
		})
	}

	function adjustTopper(topperIndex: number, adjust: Partial<TopperData['adjust']>) {
		localCars.update((cars) => {
			const topper = cars[$designShortId].toppers[topperIndex]
			topper.adjust = { ...topper.adjust, ...adjust }
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
				on:click={() => setTopper(name)}
			>
				<ContainerSvg class="h-8 w-8" viewBox="0 0 100 100">
					<Topper {name} position={[48, 115]} colors={['#79f800', '#00adf8']} />
				</ContainerSvg>
				{name}
			</button>
		{/each}
	</div>
	{#if $designCar.toppers[0]}
		<div class="grid grid-cols-1 gap-x-8 gap-y-2 lg:grid-cols-2">
			<div class="form-control lg:col-span-2">
				<label for="topperPosition" class="label">
					<span class="label-text">Place</span>
				</label>
				<input
					name="topperPosition"
					type="range"
					min={0}
					max={6}
					step="1"
					value={$designCar.toppers[0].position}
					on:input={(e) => {
						positionTopper(0, +e.currentTarget.value)
					}}
					class="range range-primary"
				/>
			</div>
			{#each axes as axis}
				<div class="form-control">
					<label for="{axis}Adjust" class="label">
						<span class="label-text">{axis === 'x' ? 'Slide' : 'Offset'}</span>
					</label>
					<input
						name="{axis}Adjust"
						type="range"
						min={-20}
						max={20}
						step="1"
						value={$designCar.toppers[0].adjust ? $designCar.toppers[0].adjust[axis] : 0}
						on:input={(e) => {
							adjustTopper(0, { [axis]: +e.currentTarget.value })
						}}
						class="range range-primary"
					/>
				</div>
			{/each}
			<div class="form-control">
				<label for="rotateAdjust" class="label">
					<span class="label-text">Tilt</span>
				</label>
				<input
					name="rotateAdjust"
					type="range"
					min={-25}
					max={25}
					step="1"
					value={$designCar.toppers[0].adjust ? $designCar.toppers[0].adjust.rotate : 0}
					on:input={(e) => {
						adjustTopper(0, { rotate: +e.currentTarget.value })
					}}
					class="range range-secondary"
				/>
			</div>
			<div class="form-control">
				<label for="scaleAdjust" class="label">
					<span class="label-text">Scale</span>
				</label>
				<input
					name="scaleAdjust"
					type="range"
					min={0.5}
					max={1.5}
					step="0.01"
					value={$designCar.toppers[0].adjust ? $designCar.toppers[0].adjust.scale : 0}
					on:input={(e) => {
						adjustTopper(0, { scale: +e.currentTarget.value })
					}}
					class="range range-secondary"
				/>
			</div>
		</div>
	{/if}
</section>
