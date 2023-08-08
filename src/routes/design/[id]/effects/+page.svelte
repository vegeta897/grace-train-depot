<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import { getDesignStores } from '../../stores'

	const { displayCar } = getDesignStores()
</script>

<section>
	<div class="mx-auto mb-6 w-64"><UserCar car={$displayCar} /></div>
</section>
