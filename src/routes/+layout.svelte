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
<div class="mx-auto w-full max-w-5xl p-6">
	<h1
		class="nunito mb-4 text-center text-2xl uppercase min-[408px]:text-3xl lg:text-left"
	>
		Grace Train Depot
	</h1>
	<slot />
</div>
