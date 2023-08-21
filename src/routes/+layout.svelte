<script lang="ts">
	import '@fontsource/nunito/900.css'
	import '@fontsource-variable/nunito'
	import '@fontsource-variable/open-sans'
	import '../app.postcss'
	import './styles.css'

	// TODO: Site name idea: "Choo Choo!"
</script>

<svelte:head>
	<title>Grace Train Depot</title>
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>
<div class="mx-auto w-full max-w-5xl pb-4 lg:p-4">
	<slot />
</div>
