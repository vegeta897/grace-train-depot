<script lang="ts">
	import {
		DECAL_NAMES,
		Decal,
		decalDefs,
		type DecalName,
	} from 'grace-train-lib/components'

	export let fill = '#ffffff'
	export let onClick: (name: DecalName) => void
</script>

<div class="col-span-4 grid grid-cols-6 gap-2">
	{#each DECAL_NAMES as name}
		{@const params = decalDefs[name].getDefaultParamsObject()}
		<button
			on:click={() => onClick(name)}
			class="btn-hover-grow btn btn-lg h-20 touch-manipulation px-0"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="-50 -50 100 100"
				class="w-8 xs:w-10"
			>
				<!-- TODO: Define default colors for decals -->
				<Decal {name} {fill} {params} />
			</svg>
		</button>
	{/each}
</div>
