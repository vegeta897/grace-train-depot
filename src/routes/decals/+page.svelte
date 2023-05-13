<script lang="ts">
	import TrainCar from '../../components/TrainCar.svelte'
	import { draggable, type DragOptions } from '@neodrag/svelte'

	const slots = [{ text: '💚' }, {}, {}, {}, {}, {}]

	const dragOptions: DragOptions = {
		bounds: 'parent',
	}
</script>

<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Decals</h1>
	<div class="relative mx-auto my-6 w-64">
		<TrainCar />
		<div
			use:draggable={dragOptions}
			class="absolute top-0 cursor-move rounded-md border-4 border-dashed text-8xl opacity-70"
		>
			💚
		</div>
	</div>
	<div class="nunito mb-8 grid grid-flow-row grid-cols-2 gap-3">
		{#each slots as slot}
			<button class="btn-block btn-lg btn gap-4 text-4xl"> {slot.text || '+'} </button>
		{/each}
	</div>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
