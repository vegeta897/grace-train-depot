<script lang="ts">
	import type { PageData } from './$types'
	import Log from './Log.svelte'

	export let data: PageData

	async function loadMoreEntries() {
		const response = await fetch(`/mod/log?before=${data.lastId}`)
		const moreLogEntries = (await response.json()) as PageData['logEntries']
		if (moreLogEntries.length === 0) {
			data.lastId = undefined
			return
		}
		data.logEntries.push(...moreLogEntries)
		data.lastId = data.logEntries.at(data.logEntries.length - 1)!.id
	}
</script>

<svelte:head><title>Choo Choo Log!</title></svelte:head>
<div class="pl-4 pt-4">
	<a href="/mod" class="btn">Back to Mod View</a>
</div>
<section class="py-4 xs:px-4">
	<div class="flex flex-col gap-4 bg-neutral p-4 xs:rounded-box lg:px-8 lg:py-6">
		<h2 class="text-2xl font-black uppercase tracking-wide">📄 Audit log</h2>
		<Log logEntries={data.logEntries} />
		<div class="flex justify-center">
			{#if data.lastId}
				<button class="btn btn-outline" on:click={() => loadMoreEntries()}>
					load more
				</button>
			{:else}
				<p class="p-1 text-lg italic text-base-content/50">end of log</p>
			{/if}
		</div>
	</div>
</section>
