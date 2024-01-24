<script lang="ts">
	export let icon:
		| 'arrow'
		| 'plus'
		| 'grid-small'
		| 'grid-large'
		| 'twitch'
		| 'downV'
		| 'upV'
		| 'x'
	let className = ''
	export { className as class }

	// TODO: Get this crap organized
	// TODO: Imported className might not work with tailwind compiler
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
{:else if icon === 'downV'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 10 10"
		class="fill-none stroke-current {className}"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M1,4 l4,4 l4,-4"
		/>
	</svg>
{:else if icon === 'upV'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 10 10"
		class="fill-none stroke-current {className}"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M1,6 l4,-4 l4,4"
		/>
	</svg>
{:else if icon === 'plus'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 9 9"
		class="stroke-current {className}"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M4.5,1.5 V7.5 M1.5,4.5 H7.5"
		/>
	</svg>
{:else if icon === 'grid-small'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 11 10"
		class="stroke-current {className}"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M1,1 h1 m3,0 h1 m3,0 h1 M1,5 h1 m3,0 h1 m3,0 h1 M1,9 h1 m3,0 h1 m3,0 h1"
		/>
	</svg>
{:else if icon === 'grid-large'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 7 6"
		class="stroke-current {className}"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M1,1 h1 m3,0 h1 M1,5 h1 m3,0 h1"
		/>
	</svg>
{:else if icon === 'twitch'}
	<!-- https://brand.twitch.tv/ -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 240 280"
		class="fill-current {className}"
	>
		<path
			d="M50,0L0,50v180h60v50l50-50h40l90-90V0H50z M220,130l-40,40h-40l-35,35v-35H60V20h160V130z"
		/>
		<rect x="170" y="55" width="20" height="60" />
		<rect x="115" y="55" width="20" height="60" />
	</svg>
{:else if icon === 'x'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 7 7"
		class="stroke-current {className}"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M1,1 L6,6 M6,1 L1,6"
		/>
	</svg>
{:else}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		class="stroke-current {className}"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1"
			d="M21,3 L3,21 M21,3 h-10 M21,3 v10"
		/>
	</svg>
{/if}
