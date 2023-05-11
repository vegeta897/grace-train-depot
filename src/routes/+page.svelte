<script lang="ts">
	import TrainCar from '../components/TrainCar.svelte'

	const buttons = [
		['🚌', 'Body'],
		['💜', 'Decals'],
		['🎡', 'Wheels'],
		['🎓', 'Toppers'],
		['✨', 'Effects'],
	]
</script>

<svelte:head>
	<title>Grace Train Depot</title>
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>

<section>
	<h1 class="nunito mb-4 text-center text-3xl uppercase">Grace Train Depot</h1>
	<TrainCar />
	<p class="my-2">Customize your Grace train car!</p>
	<p class="mb-4">Get started with one of these cool buttons 👇</p>
	<div class="nunito flex flex-col space-y-2">
		{#each buttons as [icon, title]}
			<btn class="btn-block btn-lg btn justify-start gap-8 text-xl">
				<div class="w-12 text-center text-4xl">{icon}</div>
				{title}
			</btn>
		{/each}
	</div>
</section>

<style>
</style>
