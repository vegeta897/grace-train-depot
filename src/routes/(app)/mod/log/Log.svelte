<script lang="ts">
	import type { PageData } from './$types'

	export let logEntries: PageData['logEntries']
</script>

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
		{#each logEntries as logEntry}
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
