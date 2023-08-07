<script lang="ts">
	import UserCar from '$lib/components/UserCar.svelte'
	import type { PageData } from './$types'
	import { getDesignStores } from '../stores'
	import { getNewCar } from '$lib/car'

	export let data: PageData

	const { localCar, displayCar } = getDesignStores()

	if (data.newCar && (!$localCar || $localCar.shortId !== 'new')) {
		console.log('creating new localCar')
		localCar.set(getNewCar())
	}
	if (!data.newCar && data.savedCar) {
		// TODO: Test SSR
		console.log('setting localCar to savedCar')
		localCar.set(data.savedCar)
	}
</script>

<section>
	<div class="mx-auto lg:my-6 my-4 w-48 lg:w-64"><UserCar car={$displayCar} /></div>
	<p class="my-2 text-center text-xl">Let's design a Grace Train car!</p>
	{#if !data.user}
		<div class="alert mt-8">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="stroke-info shrink-0 w-6 h-6"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path></svg
			>
			<p class="text-sm lg:text-base">
				<a href="login" class="link font-bold">Link your Twitch account</a> to appear in Grace
				Trains! You may do this at any time.
			</p>
		</div>
	{/if}
	<pre>{JSON.stringify(data, null, 2)}</pre>
	<p><a class="link" href="/design/local">self</a></p>
</section>
