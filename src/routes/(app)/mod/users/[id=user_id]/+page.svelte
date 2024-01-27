<script lang="ts">
	import { applyAction, enhance } from '$app/forms'
	import Icon from '$lib/components/Icon.svelte'
	import Log from '../../log/Log.svelte'
	import type { ActionData, PageData, SubmitFunction } from './$types'

	export let data: PageData
	export let form: ActionData

	let toTrustLevel = data.pageUser.trustLevel

	const trustLevels: (typeof toTrustLevel)[] = ['trusted', 'default', 'hidden', 'banned']

	const onSetUserLevel: SubmitFunction = () => {
		return async ({ result }) => {
			if (result.type === 'success') {
				applyAction(result)
				data.pageUser.trustLevel = result.data!.trustLevel
			}
		}
	}
</script>

<svelte:head><title>Choo Choo {data.pageUser.twitchDisplayName}!</title></svelte:head>
<div class="pl-4 pt-4">
	<a href="/mod" class="btn">Back to Mod View</a>
</div>
<section
	class="my-4 flex flex-col gap-4 bg-neutral px-4 py-4 xs:rounded-box xs:mx-4 xs:px-6"
>
	<div class="flex flex-wrap items-baseline gap-6">
		<h2 class="text-3xl font-bold">{data.pageUser.twitchDisplayName}</h2>
		<a
			class="link flex items-center gap-2"
			href="https://twitch.tv/{data.pageUser.twitchUsername}"
		>
			<Icon icon="twitch" class="w-4" />
			<span class="">visit twitch profile</span>
		</a>
	</div>
	<div class="stats stats-vertical max-w-[42rem] rounded-lg md:stats-horizontal">
		<div class="stat">
			<div class="stat-title">started designing</div>
			<div class="stat-value">
				{data.pageUser.createdAtRelative[0]}
				<span class="text-2xl leading-[inherit]"
					>{data.pageUser.createdAtRelative[1]} ago</span
				>
			</div>
			<time class="stat-desc text-sm" datetime={data.pageUser.createdAt.toISOString()}>
				<div
					class="tooltip tooltip-right"
					data-tip={data.pageUser.createdAt.toLocaleTimeString()}
				>
					{data.pageUser.createdAt.toLocaleDateString()}
				</div>
			</time>
		</div>
		{#if data.pageUser.lastActive && data.pageUser.lastActiveRelative}
			<div class="stat">
				<div class="stat-title">last designed</div>
				<div class="stat-value">
					{data.pageUser.lastActiveRelative[0]}
					<span class="text-2xl leading-[inherit]"
						>{data.pageUser.lastActiveRelative[1]} ago</span
					>
				</div>
				<time class="stat-desc text-sm" datetime={data.pageUser.lastActive.toISOString()}>
					<div
						class="tooltip tooltip-right"
						data-tip={data.pageUser.lastActive.toLocaleTimeString()}
					>
						{data.pageUser.lastActive.toLocaleDateString()}
					</div>
				</time>
			</div>
		{/if}
		<div class="stat">
			<div class="stat-title">total designs</div>
			<div class="stat-value">{data.pageUser.carCount}</div>
			<div class="stat-desc"></div>
		</div>
	</div>
	<div class="flex flex-wrap items-start gap-4">
		<form
			use:enhance={onSetUserLevel}
			action="?/setUserLevel"
			method="POST"
			class="flex basis-[13rem] flex-col gap-4 rounded-lg bg-base-200/70 px-6 py-4"
		>
			<h3 class="text-lg font-bold">user level</h3>
			<div>
				{#each trustLevels as level}
					<label class="label cursor-pointer py-1">
						{level}
						<input
							type="radio"
							name="trustLevel"
							class="radio"
							class:radio-success={level === 'trusted'}
							class:radio-warning={level === 'hidden'}
							class:radio-error={level === 'banned'}
							bind:group={toTrustLevel}
							value={level}
						/>
					</label>
				{/each}
			</div>
			<button
				disabled={toTrustLevel === data.pageUser.trustLevel}
				class="btn btn-neutral btn-block"
			>
				{#if form?.trustLevel && toTrustLevel === data.pageUser.trustLevel}
					✔️ Saved
				{:else}
					Save
				{/if}
			</button>
		</form>
		<div class="flex grow basis-96 flex-col gap-2 rounded-lg bg-base-100 px-6 py-4">
			<p>
				<strong class="text-success">trusted</strong> users skip the mod queue
			</p>
			<p>
				<strong>default</strong> users will appear in the mod queue so their cars can be reviewed
			</p>
			<p>
				<strong class="text-warning">hidden</strong> users are excluded from grace trains but
				can still use the site. they should be reviewed to decide whether to restore them to
				the default level or ban them
			</p>
			<p>
				<strong class="text-error">banned</strong> users are excluded from grace trains and
				cannot use the site
			</p>
		</div>
	</div>
	<h3 class="text-2xl font-bold">
		recent log events for {data.pageUser.twitchDisplayName}
	</h3>
	<Log logEntries={data.logEntries} />
</section>
