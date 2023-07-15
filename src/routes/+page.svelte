<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
</script>

<section class="flex flex-col items-center justify-center p-4 md:p-8">
	<div class="w-full max-w-lg rounded-2xl bg-neutral p-6 md:p-10">
		<p>Hello, {data.user.twitchDisplayName}!</p>
		<a href="design" class="nunito btn-lg btn">Get Started</a>
	</div>
</section>
