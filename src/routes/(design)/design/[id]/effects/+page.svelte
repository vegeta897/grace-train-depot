<script lang="ts">
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { getDesignStores } from '../stores'

	const { designCar } = getDesignStores()
</script>

<section>
	<div class="mx-auto mb-6 w-64"><DesignCar car={$designCar} /></div>
</section>
