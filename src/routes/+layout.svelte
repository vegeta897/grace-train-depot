<script lang="ts">
	import '../app.postcss'
	import Header from './Header.svelte'
	import '@fontsource/nunito/900.css'
	import '@fontsource/nunito/variable.css'
	import './styles.css'
</script>

<div class="flex h-screen flex-col items-center justify-center bg-base-100 p-4">
	<div class="max-w-lg rounded-2xl bg-base-200 p-6 text-neutral-content">
		<slot />
	</div>
</div>

<style>
</style>
