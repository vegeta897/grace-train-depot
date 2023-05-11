<script lang="ts">
	import type { ComponentType } from 'svelte'
	import TrainCar from '../../components/TrainCar.svelte'

	const bodies: [ComponentType, string][] = [
		[TrainCar, 'boxy'],
		[TrainCar, 'tanky'],
	]
</script>

<section>
	<h1 class="nunito mb-4 text-center text-5xl uppercase">Body</h1>
	<div class="nunito mb-8 flex flex-col space-y-2">
		{#each bodies as [component, name]}
			<button class="btn-lg btn h-32 justify-start gap-8 text-xl">
				<div class="w-32"><svelte:component this={component} /></div>
				{name}
			</button>
		{/each}
	</div>
	<a href=".." class="btn-block btn-lg btn text-xl"> Back </a>
</section>
