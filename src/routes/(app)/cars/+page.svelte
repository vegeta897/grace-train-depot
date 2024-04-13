<script lang="ts">
	import CarGrid from '../CarGrid.svelte'
	import type { PageData } from './$types'

	export let data: PageData
	const cars = data.cars!
</script>

<!-- TODO: Simplified CarGrid, no expand/shrink button, maybe just a "show more" button -->
<CarGrid {cars} />
