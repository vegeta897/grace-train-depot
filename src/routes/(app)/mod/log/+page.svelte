<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	async function loadMoreEntries() {
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

<svelte:head><title>Choo Choo Log!</title></svelte:head>
<div class="pl-4 pt-4">
	<a href="/mod" class="btn">Back to Mod View</a>
</div>
<section class="p-4">
	<div class="rounded-box flex flex-col gap-4 bg-neutral p-4 lg:px-8 lg:py-6">
		<h2 class="text-2xl font-black uppercase tracking-wide">📄 Audit log</h2>
		<table class="table table-zebra table-xs sm:table-md lg:table-lg">
			<thead class="sm:text-base">
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
						<td>
							{#if logEntry.modUser}
								<a class="link" href="/mod/users/{logEntry.modUser.id}">
									{logEntry.modUser.twitchDisplayName}
								</a>
							{:else}
								<em class="text-base-content/50">deleted user</em>
							{/if}
						</td>
						<td>
							{#if logEntry.action === 'changeUserLevel'}
								changed
								{#if logEntry.onUser}
									user
									<a class="link" href="/mod/users/{logEntry.onUser.id}">
										{logEntry.onUser.twitchDisplayName}
									</a>
								{:else}
									<em class="text-base-content/50">(deleted user)</em>
								{/if}
								to
								<strong
									class:text-success={logEntry.data === 'trusted'}
									class:text-warning={logEntry.data === 'hidden'}
									class:text-error={logEntry.data === 'banned'}
								>
									{logEntry.data}
								</strong>
							{:else}
								deleted {logEntry.data}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
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
