<script lang="ts">
	import { page } from '$app/stores'

	const pages = [
		['🚌', 'body'],
		['💜', 'decals'],
		['🎡', 'wheels'],
		['🎓', 'toppers'],
		['✨', 'effects'],
	]

	$: pageName = $page.route.id?.split('/')[2]
	$: pageIndex = pages.findIndex((b) => b[1] === pageName)
	$: prevPage = pages[pageIndex - 1]
	$: nextPage = pages[pageIndex + 1]
</script>

<div class="lg:flex lg:items-start">
	<div class="nunito rounded-box hidden w-80 flex-col space-y-2 bg-neutral p-6 lg:flex">
		{#each pages as [icon, name]}
			{@const route = `/design/${name}`}
			{#if route !== $page.route.id}
				<a href={route} class="btn-block btn-lg btn justify-start gap-8 text-xl">
					<div class="w-12 text-center text-4xl">{icon}</div>
					{name}
				</a>
			{:else}
				<div class="btn-disabled btn-block btn-lg btn flex justify-start gap-8 text-xl">
					<div class="w-12 text-center text-4xl">{icon}</div>
					{name}
				</div>
			{/if}
		{/each}
	</div>
	<div class="lg:flex-grow lg:px-8">
		<slot />
	</div>
	<div class="nunito grid grid-cols-2 gap-4 lg:hidden">
		{#each [prevPage, nextPage] as navPage}
			{#if navPage}
				<a
					href="/design/{navPage[1]}"
					class:col-start-2={!prevPage}
					class:btn-primary={navPage === nextPage}
					class="btn-lg btn">{navPage[1]}</a
				>
			{/if}
		{/each}
	</div>
</div>
