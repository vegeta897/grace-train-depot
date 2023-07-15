<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
</script>

<section class="flex flex-col items-center justify-center p-4 md:p-8">
	<div class="w-full max-w-lg rounded-2xl bg-neutral p-6 md:p-10">
		{#if data.user}
			<p>Hello, {data.user.twitchUsername}!</p>
			<a href="design" class="nunito btn btn-lg">Get Started</a>
		{:else}
			<a href="login" class="nunito btn btn-lg">Log in with Twitch</a>
		{/if}
	</div>
</section>
