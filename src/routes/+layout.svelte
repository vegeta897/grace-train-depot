<script lang="ts">
	import '@fontsource/nunito/900.css'
	import '@fontsource-variable/nunito'
	import '@fontsource-variable/open-sans'
	import '../app.postcss'
	import './styles.css'
</script>

<svelte:head>
	<title>Choo Choo!</title>
	<meta name="description" content="Customize your Grace Train car" />
</svelte:head>
<div
	class="mx-auto w-full max-w-5xl pb-4 selection:bg-primary selection:text-primary-content lg:p-4"
>
	<slot />
</div>
