<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	async function getMoreEntries() {
		const response = await fetch(`/mod/log?before=${data.lastId}`)
		const moreLogEntries = (await response.json()) as PageData['logEntries']
		if (moreLogEntries.length === 0) {
			data.lastId = undefined
			return
		}
		data.logEntries.push(...moreLogEntries)
		data.lastId = data.logEntries.at(-1)!.id
	}
</script>

<svelte:head>
	<title>Choo Choo Log!</title>
</svelte:head>
<div class="pl-4 pt-4">
	<a href="/mod" class="btn">Back to Mod View</a>
</div>
<section class="p-4">
	<div class="rounded-box flex flex-col gap-4 bg-neutral p-4">
		<h2 class="text-2xl font-black uppercase tracking-wide">📄 Audit log</h2>
		<table class="table table-lg">
			<thead class="text-base">
				<tr>
					<th>date</th>
					<th>time</th>
					<th>mod</th>
					<th>action</th>
				</tr>
			</thead>
			<tbody>
				{#each data.logEntries as logEntry}
					{@const addedAt = new Date(logEntry.addedAt)}
					<tr>
						<td>{addedAt.toLocaleDateString()}</td>
						<td>{addedAt.toLocaleTimeString()}</td>
						<td>{logEntry.modUser?.twitchDisplayName}</td>
						<td>
							{logEntry.action}
							{logEntry.data}
							{logEntry.onUser?.twitchDisplayName}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if data.lastId}
			<div>
				<button class="btn btn-outline" on:click={() => getMoreEntries()}>
					load more
				</button>
			</div>
		{:else}
			<p class="p-1 text-lg italic text-base-content/50">end of log</p>
		{/if}
	</div>
</section>
