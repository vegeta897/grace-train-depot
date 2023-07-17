<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { ContainerSvg } from 'grace-train-lib'
	import type { PageData } from './$types'
	import { updateCar } from '$lib/car'
	import type { Car } from '$lib/types'

	export let data: PageData
	// TODO: Use "indicator" daisyUI class to indicate new/unique items

	const hats = [
		[null, 'none'],
		['#ff0000', 'rose'],
		['#00ff00', 'lime'],
		['#0000ff', 'deep'],
		['#00ffff', 'sky'],
		['#ffff00', 'sun'],
		['#ff00ff', 'pop'],
	]

	function setHatColor(color: Car['hat']['color']) {
		data.car.hat.color = color
		updateCar(data.car.id, { hat: { color } })
	}
</script>

<section>
	<div class="mx-auto my-6 w-64"><UserCar car={data.car} /></div>
	<div class="nunito mb-8 grid grid-cols-3 gap-3 lg:grid-cols-4">
		{#each hats as [color, name]}
			<button
				class="btn btn-lg btn-block flex h-28 flex-col justify-center gap-2 text-xl lg:h-32 lg:gap-3"
				on:click={() => setHatColor(color)}
			>
				<ContainerSvg class="h-10 w-10" viewBox="0 0 10 8">
					{#if color}
						<path fill={color} d="M0,8 L5,0 L10,8 Z" />
					{/if}
				</ContainerSvg>
				{name}
			</button>
		{/each}
	</div>
</section>
