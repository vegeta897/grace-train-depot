<script lang="ts">
	import { PAGES } from '$lib/common/constants'

	export let currentPage: string
	export let carShortId: string
</script>

<div class="tabs-boxed tabs">
	{#each PAGES as [icon, name]}
		{@const current = name === currentPage}
		<a
			data-sveltekit-noscroll
			class:pointer-events-none={current}
			class:tab-active={current}
			href="/design/{carShortId}/{name}"
			class="tab h-11 grow px-0 text-2xl 2xs:h-12 2xs:text-3xl xs:px-[var(--tab-padding,1rem)]"
		>
			{icon}
		</a>
	{/each}
</div>
