<script lang="ts">
	import '@fontsource/nunito/400.css'
	import '@fontsource/nunito/700.css'
	import '@fontsource/nunito/900.css'
	import '@fontsource-variable/nunito'
	import '../app.postcss'
	import './styles.css'
</script>

<svelte:head>
	<title>Choo Choo!</title>
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>
<div
	class="full-height mx-auto flex w-full max-w-5xl flex-col selection:bg-primary selection:text-primary-content lg:p-4"
>
	<slot />
</div>

<style>
	.full-height {
		height: 100dvh;
		height: 100vh;
	}
</style>
