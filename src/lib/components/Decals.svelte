<script lang="ts">
	import type { DecalDataWithId } from '$lib/server/schemas'
	import { Decal } from 'grace-train-lib/components'
	import type { ComponentProps } from 'svelte'

	export let decals: DecalDataWithId[]
	export let transition: ComponentProps<Decal>['transition'] = 'none'
	export let animateAppear = false
</script>

{#each decals as decal, d (decal.id)}
	<Decal
		name={decal.name}
		transform={decal.transform}
		fill={decal.fillPreview || decal.fill}
		params={decal.params}
		{transition}
		{animateAppear}
		delayAppear={d * 70}
	/>
{/each}
