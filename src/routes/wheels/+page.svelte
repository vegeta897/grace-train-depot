<script lang="ts">
	import TrainCar from '../../components/TrainCar.svelte'

	const wheels = [
		['#f00', 'rose'],
		['#0f0', 'lime'],
		['#00f', 'deep'],
		['#0ff', 'sky'],
		['#ff0', 'sun'],
		['#f0f', 'pop'],
	]
</script>

<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Wheels</h1>
	<div class="mx-auto my-6 w-64"><TrainCar /></div>
	<div class="nunito mb-8 grid grid-flow-row grid-cols-2 gap-3">
		{#each wheels as [color, name]}
			<button class="btn-block btn-lg btn justify-start gap-4 text-xl">
				<div class="h-10 w-10 rounded-full" style:background={color} />
				{name}
			</button>
		{/each}
	</div>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
