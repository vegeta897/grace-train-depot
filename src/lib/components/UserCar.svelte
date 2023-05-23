<script lang="ts">
	import { Body, Decal, type BodyName } from 'grace-train-lib'
	import { userCar } from '../store'

	export let bodyOverride: BodyName | null = null
	export let transition = false
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
