<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import type { PageData } from './$types'
	import { page } from '$app/stores'

	export let data: PageData

	$: local = $page.params.id === 'local'
</script>

<section>
	<div class="mx-auto my-6 w-64"><UserCar car={data.car} /></div>
	<p class="my-2 text-center text-xl">Let's design a Grace Train car!</p>
	{#if local}
		<div class="alert alert-info mt-8">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-current shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path></svg
			>
			<p>
				To appear in Grace Trains, you will need to <a href="login" class="link font-bold"
					>link your Twitch account</a
				><br />You can do that now or when you finish this car
			</p>
		</div>
	{/if}
</section>
