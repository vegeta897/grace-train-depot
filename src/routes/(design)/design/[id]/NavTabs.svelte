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
			class="tab flex h-11 grow flex-col px-0 text-2xl 2xs:h-12 2xs:text-3xl xs:px-[var(--tab-padding,1rem)] lg:h-20 lg:w-32"
		>
			{icon}
			<span class="hidden text-lg font-black uppercase lg:block">{name}</span>
		</a>
	{/each}
</div>
