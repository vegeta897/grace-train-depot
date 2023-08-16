<script lang="ts">
	import type { DecalData } from '$lib/schemas'
	import { Decal } from 'grace-train-lib'
	import type { ComponentProps } from 'svelte'

	export let decals: DecalData[]
	export let transition: ComponentProps<Decal>['transition'] = 'none'
</script>

{#each decals as decal (decal.id)}
	<Decal
		name={decal.name}
		transform={decal.transform}
		fill={decal.fillPreview || decal.fill}
		{transition}
	/>
{/each}
