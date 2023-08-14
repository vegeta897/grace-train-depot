<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import Car from '$lib/components/Car.svelte'
	import { COLORS } from 'grace-train-lib'
	import { PUBLIC_HOST } from '$env/static/public'
	import { fade } from 'svelte/transition'
	import { cubicIn } from 'svelte/easing'

	export let data: PageData

	$: imageUrl = `${PUBLIC_HOST}/assets/car_${data.car.shortId}_${data.car.revision}.png`

	let copied = false

	function copyLink() {
		navigator.clipboard.writeText(PUBLIC_HOST + $page.url.pathname)
		copied = true
		setTimeout(() => (copied = false), 3000)
	}
</script>

<svelte:head>
	<meta property="og:title" content="Grace Train Depot" />
	<meta property="twitter:title" content="Grace Train Depot" />
	<meta property="twitter:card" content="summary" />
	<meta property="twitter:image" content={imageUrl} />
	<meta name="twitter:creator" content="@vegeta897" />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="375" />
	<meta property="og:image:height" content="300" />
	<meta name="theme-color" content="${COLORS.POP}" />
</svelte:head>
<section class="flex flex-col items-center gap-4 px-4 py-8">
	<div class="max-w-md"><Car car={data.car} /></div>
	{#if data.car.name}<h2 class="nunito text-4xl">{data.car.name}</h2>{/if}
	<a href="/design/{data.car.shortId}" class="btn btn-primary btn-lg">Design</a>
	<button class="btn btn-secondary" on:click={copyLink}>Copy Link</button>
</section>
{#if copied}
	<div class="toast toast-center toast-top" out:fade={{ duration: 200, easing: cubicIn }}>
		<div class="alert alert-success"><span>Link copied!</span></div>
	</div>
{/if}
