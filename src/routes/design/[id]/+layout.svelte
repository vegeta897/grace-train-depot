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

<div class="lg:flex lg:items-start max-w-2xl lg:max-w-full mx-auto">
	<div
		class="nunito rounded-box hidden w-80 flex-col shrink-0 space-y-2 bg-neutral p-6 lg:flex"
	>
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
	<div class="grow space-y-2 flex flex-col items-center min-w-0">
		<div
			class="lg:hidden tabs tabs-boxed self-stretch xs:self-center mx-2 justify-center"
		>
			{#each pages as [icon, name]}
				{@const current = name === currentPage}
				<a
					data-sveltekit-noscroll
					class:pointer-events-none={current}
					class:tab-active={current}
					href="/design/{$page.params.id}/{name}"
					class="tab text-2xl 2xs:text-3xl h-11 2xs:h-12 grow px-0 xs:px-[var(--tab-padding,1rem)]"
				>
					{icon}
				</a>
			{/each}
		</div>
		{#if currentPage}
			<h2 class="nunito uppercase text-3xl">{currentPage}</h2>
		{/if}
		<div class="p-4 lg:grow lg:px-8 lg:py-0 self-stretch">
			<slot />
		</div>
	</div>
</div>
