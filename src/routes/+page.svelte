<script lang="ts">
	const buttons = [
		['🚌', 'Body'],
		['⭐', 'Decals'],
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
	<h1 class="nunito text-center text-2xl uppercase">Grace Train Depot</h1>
	<p class="mb-4 mt-2">Customize your Grace train car!</p>
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
