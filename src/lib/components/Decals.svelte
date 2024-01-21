<script lang="ts">
	import type { DecalDataWithId } from '$lib/server/schemas/decals'
	import { Decal } from 'grace-train-lib/components'
	import type { ComponentProps } from 'svelte'

	export let decals: DecalDataWithId[]
	export let transition: ComponentProps<Decal>['transition'] = 'none'
</script>

{#each decals as decal (decal.id)}
	<Decal
		name={decal.name}
		x={decal.x}
		y={decal.y}
		scale={decal.scale}
		rotate={decal.rotate}
		fill={decal.fill}
		params={decal.params}
		{transition}
	/>
{/each}
