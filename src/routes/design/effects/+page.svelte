<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import type { PageData } from './$types'

	export let data: PageData
</script>

<section>
	<div class="mx-auto my-6 w-64"><UserCar car={data.car} /></div>
</section>
