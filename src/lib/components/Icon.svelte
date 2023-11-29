<script lang="ts">
	export let icon: 'arrow' | 'plus'
	let className = ''
	export { className as class }
</script>

{#if icon === 'arrow'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 10 10"
		class="fill-none stroke-current {className}"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M5,2 v7 l-2.5,-2.5 m2.5,2.5 l2.5,-2.5"
		/>
	</svg>
{:else if icon === 'plus'}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" class="w-full stroke-current">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4.5,1.5 V7.5 M1.5,4.5 H7.5"
		/>
	</svg>
{:else}
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9" class="w-full stroke-current">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1"
			d="M2,2 L7,7 M7,2 L2,7"
		/>
	</svg>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		class="h-1/2 w-1/2 stroke-current"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1"
			d="M21,3 L3,21 M21,3 h-10 M21,3 v10"
		/>
	</svg>
{/if}
