<script lang="ts">
	import { browser } from '$app/environment'
	import DesignCar from '$lib/components/DesignCar.svelte'
	import { getDesignStores } from '../stores'

	const { designCar } = getDesignStores()
</script>

<section>
	<div class="mx-auto mb-6 w-64">
		{#if browser}<DesignCar car={$designCar} />{/if}
	</div>
</section>
