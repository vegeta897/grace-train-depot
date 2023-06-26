<script lang="ts">
	import { page } from '$app/stores'
	import type { LayoutData } from './$types'

	const pages = [
		['🚌', 'body'],
		['🎓', 'toppers'],
		['🎡', 'wheels'],
		['💜', 'decals'],
		['✨', 'effects'],
	]
</script>

<div class="lg:flex lg:items-start">
	<div class="nunito rounded-box hidden w-80 flex-col space-y-2 bg-neutral p-6 lg:flex">
		{#each pages as [icon, name]}
			{@const route = `/design/${name}`}
			{@const currentPage = route === $page.route.id}
			<a
				href={route}
				class="btn-block btn-lg btn justify-start gap-8 text-xl"
				class:pointer-events-none={currentPage}
				class:btn-neutral={currentPage}
			>
				<div class="w-12 text-center text-4xl">{icon}</div>
				{name}
			</a>
		{/each}
	</div>
	<div class="flex-grow space-y-2">
		{#each pages as [icon, name]}
			{@const route = `/design/${name}`}
			{@const currentPage = route === $page.route.id}
			<a
				data-sveltekit-noscroll
				class="nunito btn mx-4 flex justify-start gap-4 text-xl uppercase lg:hidden"
				class:pointer-events-none={currentPage}
				class:btn-neutral={currentPage}
				href="/design/{name}"
			>
				<span>{icon}</span>
				{name}
			</a>
			{#if currentPage}
				<div class="p-4 lg:flex-grow lg:px-8 lg:py-0">
					<slot />
				</div>
			{/if}
		{/each}
	</div>
</div>
