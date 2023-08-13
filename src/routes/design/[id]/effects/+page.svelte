<script lang="ts">
	import Car from '$lib/components/Car.svelte'
	import { getDesignStores } from '../../stores'

	const { designCar } = getDesignStores()
</script>

<section>
	<div class="mx-auto mb-6 w-64"><Car car={$designCar} /></div>
</section>
