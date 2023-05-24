<script lang="ts">
	import '../app.postcss'
	import '@fontsource/nunito/900.css'
	import '@fontsource-variable/nunito'
	import './styles.css'
</script>

<svelte:head>
	<title>Grace Train Depot</title>
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>
<div class="flex flex-col items-center justify-center bg-base-100 p-4 md:p-8">
	<div class="w-full max-w-lg rounded-2xl bg-base-200 p-6 text-neutral-content md:p-10">
		<slot />
	</div>
</div>

<style>
</style>
