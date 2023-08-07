<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { getDesignStores } from '../../stores'

	const { displayCar } = getDesignStores()
</script>

<section>
	<p class="text-center text-lg font-bold">What a cool car!</p>
	<div class="mx-auto my-6 w-64"><UserCar car={$displayCar} /></div>
</section>
