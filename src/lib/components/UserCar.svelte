<script lang="ts">
	import { BODY } from '$lib/body'
	import { userCar } from '../store'

	$: bodyComponent = BODY.find((b) => b.name === $userCar.body)!.component
</script>

<svelte:component this={bodyComponent}>
	<slot />
</svelte:component>
