<script lang="ts">
	import { TrainCar } from 'grace-train-lib'

	const buttons = [
		['🚌', 'body'],
		['💜', 'decals'],
		['🎡', 'wheels'],
		['🎓', 'toppers'],
		['✨', 'effects'],
	]
</script>

<svelte:head>
	<title>Grace Train Depot</title>
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>

<section>
	<h1 class="nunito mb-4 text-center text-3xl uppercase">Grace Train Depot</h1>
	<div class="mx-auto my-6 w-64"><TrainCar /></div>
	<p class="my-2">Customize your Grace train car!</p>
	<p class="mb-4">Get started with one of these cool buttons 👇</p>
	<div class="nunito flex flex-col space-y-2">
		{#each buttons as [icon, name]}
			<a href={name} class="btn-block btn-lg btn justify-start gap-8 text-xl">
				<div class="w-12 text-center text-4xl">{icon}</div>
				{name}
			</a>
		{/each}
	</div>
</section>

<style>
</style>
