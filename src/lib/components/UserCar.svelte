<script lang="ts">
	import { Body, Decal, type BodyName } from 'grace-train-lib'
	import { userCar } from '../store'
	import type { ComponentProps } from 'svelte'

	export let bodyOverride: BodyName | null = null
	export let transition: ComponentProps<Decal>['transition'] = 'none'
</script>

<Body name={bodyOverride || $userCar.body}>
	{#each $userCar.decals as userDecal (userDecal.id)}
		<Decal
			name={userDecal.name}
			transform={userDecal.transform}
			fill={userDecal.fill}
			{transition}
		/>
	{/each}
</Body>
