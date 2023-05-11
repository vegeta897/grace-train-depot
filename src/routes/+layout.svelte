<script>
	import '../app.postcss'
	import Header from './Header.svelte'
	import './styles.css'
</script>

<div class="flex h-screen items-start justify-center bg-base-200 p-4">
	<div class="max-w-lg rounded-2xl bg-base-100 p-6">
		<slot />
	</div>
</div>

<style>
</style>
