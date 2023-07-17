<script lang="ts">
	import { page } from '$app/stores'

	const pages = [
		['🚌', 'body'],
		['🎓', 'toppers'],
		['🎡', 'wheels'],
		['💜', 'decals'],
		['✨', 'effects'],
	]

	$: currentPage = $page.route.id?.split('/')[3]
</script>

<div class="lg:flex lg:items-start">
	<div class="nunito rounded-box hidden w-80 flex-col space-y-2 bg-neutral p-6 lg:flex">
		{#each pages as [icon, name]}
			{@const current = name === currentPage}
			<a
				href="/design/{$page.params.id}/{name}"
				class="btn btn-lg btn-block justify-start gap-8 text-xl"
				class:pointer-events-none={current}
				class:btn-neutral={current}
			>
				<div class="w-12 text-center text-4xl">{icon}</div>
				{name}
			</a>
		{/each}
	</div>
	<div class="flex-grow space-y-2">
		{#each pages as [icon, name]}
			{@const current = name === currentPage}
			<a
				data-sveltekit-noscroll
				href="/design/{$page.params.id}/{name}"
				class="nunito btn mx-4 flex justify-start gap-4 text-xl uppercase lg:hidden"
				class:pointer-events-none={current}
				class:btn-neutral={current}
			>
				<span>{icon}</span>
				{name}
			</a>
		{/each}
		<div class="p-4 lg:flex-grow lg:px-8 lg:py-0">
			<slot />
		</div>
	</div>
</div>
