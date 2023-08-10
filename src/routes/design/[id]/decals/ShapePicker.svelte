<script lang="ts">
	import { DECAL_NAMES, Decal, type DecalName } from 'grace-train-lib'

	export let fill = '#ffffff'
	export let onClick: (name: DecalName) => void
</script>

<div class="col-span-4 grid grid-cols-6 gap-2">
	{#each DECAL_NAMES as name}
		<button
			on:click={() => onClick(name)}
			class="btn-lg btn touch-manipulation px-0 btn-hover-grow"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="-50 -50 100 100"
				class="w-8 xs:w-10"
			>
				<!-- TODO: Define default colors for decals -->
				<Decal {name} {fill} />
			</svg>
		</button>
	{/each}
</div>
