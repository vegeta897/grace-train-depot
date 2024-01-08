<script lang="ts">
	import '@fontsource/nunito/400.css'
	import '@fontsource/nunito/700.css'
	import '@fontsource/nunito/900.css'
	import '@fontsource-variable/nunito'
	import '../app.postcss'
	import './styles.css'
	import { COLOR_NAMES } from 'grace-train-lib'
</script>

<svelte:head>
	<meta name="theme-color" content={COLOR_NAMES.POP.POP} />
</svelte:head>
<div
	class="full-height mx-auto flex w-full max-w-5xl flex-col selection:bg-primary selection:text-primary-content sm:p-4"
>
	<slot />
</div>

<style>
	.full-height {
		min-height: 100dvh;
		min-height: 100vh;
	}
</style>
