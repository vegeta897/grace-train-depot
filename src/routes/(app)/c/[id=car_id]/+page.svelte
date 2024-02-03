<script lang="ts">
	import type { PageData, SubmitFunction } from './$types'
	import { page } from '$app/stores'
	import { PUBLIC_HOST } from '$env/static/public'
	import { fade } from 'svelte/transition'
	import { cubicIn } from 'svelte/easing'
	import { enhance } from '$app/forms'
	import { CAR_NAME_MAX_LENGTH } from '$lib/common/constants'
	import { Car } from 'grace-train-lib/components'
	import { getCarViewBox } from '$lib/car'
	import { pluralize } from '$lib/util'
	import Theme from '$lib/components/Theme.svelte'

	export let data: PageData

	let renaming = false
	let toName: string
	let deleting = false
	let wantDelete: boolean
	let understandDelete: boolean
	let toastMessage: string | null = null

	$: if (!renaming) toName = data.car.name
	$: if (!deleting) wantDelete = false
	$: if (!deleting) understandDelete = false

	$: embedTitle = `"${data.car.name}" by ${data.car.twitchName}`
	$: imageUrl = `${PUBLIC_HOST}/assets/car_${data.car.shortId}.png?${data.car.revision}`

	const onRename: SubmitFunction = ({ cancel }) => {
		if (toName === data.car.name) return cancel()
		return async ({ result }) => {
			if (result.type === 'success') {
				const { data: resultData } = result as { data: { name: string } }
				data.car.name = resultData.name
				toName = resultData.name
				renaming = false
				setToast('car renamed!')
			} else {
				console.log(result.type, result.status)
			}
		}
	}

	function copyLink() {
		navigator.clipboard.writeText(PUBLIC_HOST + $page.url.pathname)
		setToast('link copied!')
	}

	function copyGraceMessage(identifier: string) {
		navigator.clipboard.writeText(`GRACE ${identifier}`)
		setToast('message copied!')
	}

	let toastTimeout: number
	function setToast(message: string) {
		toastMessage = message
		clearTimeout(toastTimeout)
		toastTimeout = window.setTimeout(() => (toastMessage = null), 3000)
	}
</script>

<svelte:head>
	<meta property="og:title" content={embedTitle} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:site_name" content="choochoo.fun" />
	<meta property="twitter:title" content={embedTitle} />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:image" content={imageUrl} />
	<meta property="twitter:site" content="choochoo.fun" />
</svelte:head>
<section class="card mb-4 rounded-none bg-neutral xs:rounded-box md:card-side xs:m-6">
	<figure class="bg-base-200/70 p-4 md:w-1/2 md:p-6 lg:px-12 lg:py-8">
		<div class="h-auto max-w-[32rem] gap-2">
			<Car car={{ depotCar: data.car }} viewBox={getCarViewBox(data.car)} />
		</div>
	</figure>
	<div class="card-body gap-4 p-4 xs:px-6 md:p-6 lg:max-w-[50%] lg:p-8 lg:px-8">
		<h2
			class="card-title flex-wrap content-start items-baseline gap-x-4 gap-y-0 text-3xl font-black lg:text-4xl"
		>
			{data.car.name}
			<small class="text-lg font-normal text-base-content/70">
				by <strong>{data.car.twitchName}</strong>
			</small>
		</h2>
		<div class="flex flex-wrap gap-2 px-2">
			{#each data.car.themes as theme}
				<Theme {theme} />
			{/each}
		</div>
		<div class="stats mt-auto grid-cols-2">
			<div class="stat px-4 xs:px-6">
				<div class="stat-title">appeared</div>
				<div class="stat-value text-xl">
					<span class="text-2xl leading-[inherit]">
						{data.car.stats?.totalAppearances ?? 0}
					</span>
					{pluralize(data.car.stats?.totalAppearances ?? 0, 'time')}
				</div>
				<div class="stat-desc text-sm">
					in <strong>{data.car.stats?.trainCount ?? 0}</strong>
					{pluralize(data.car.stats?.trainCount ?? 0, 'grace train')}
				</div>
			</div>
			<div class="stat px-4 xs:px-6">
				<div class="stat-title">last seen</div>
				<div class="stat-value text-xl">
					<span class="text-2xl leading-[inherit]">
						{data.car.stats?.lastAppearanceRelative[0] ?? 'never'}
					</span>
					{#if data.car.stats}
						{data.car.stats.lastAppearanceRelative[1]} ago
					{/if}
				</div>
				<div class="stat-desc text-sm">
					{#if data.car.stats}
						on {data.car.stats.lastAppearance.toLocaleDateString()}
					{:else}
						maybe next stream
					{/if}
				</div>
			</div>
		</div>
		{#if data.car.belongsToUser}
			<div class="rounded-box box-content flex flex-col bg-base-100 px-4 py-4 xs:px-6">
				<a href="/design/{data.car.shortId}" class="btn btn-secondary w-full text-xl">
					Design
				</a>
				<div class="divider my-2" />
				{#if deleting}
					<!-- TODO: Make this a modal dialog -->
					<div class="flex grow flex-col gap-4">
						<form class="flex flex-col gap-4" use:enhance action="?/delete" method="POST">
							<div>
								<label class="label cursor-pointer justify-end gap-3">
									<span class="text-lg">i want to delete this car</span>
									<input
										required
										type="checkbox"
										bind:checked={wantDelete}
										class="checkbox-error checkbox"
									/>
								</label>
								<label class="label cursor-pointer justify-end gap-3">
									<span class="text-lg">i know it can't be undone</span>
									<input
										required
										type="checkbox"
										bind:checked={understandDelete}
										class="checkbox-error checkbox"
									/>
								</label>
							</div>
							<div class="flex w-full justify-between">
								<button type="button" class="btn" on:click={() => (deleting = false)}>
									Cancel
								</button>
								<button disabled={!wantDelete || !understandDelete} class="btn btn-error">
									Delete
								</button>
							</div>
						</form>
					</div>
				{:else if renaming}
					<div class="flex grow flex-col justify-center gap-4">
						<form
							class="flex flex-col gap-3"
							use:enhance={onRename}
							method="POST"
							action="?/rename"
						>
							<div class="grow">
								<input
									required
									type="text"
									autocomplete="off"
									name="carName"
									class="input input-bordered w-full invalid:input-warning"
									bind:value={toName}
									placeholder="type a name"
									maxlength={CAR_NAME_MAX_LENGTH}
								/>
							</div>
							<div class="flex w-full justify-between">
								<button type="button" class="btn" on:click={() => (renaming = false)}>
									Cancel
								</button>
								<button disabled={toName === data.car.name} class="btn btn-primary"
									>Rename</button
								>
							</div>
						</form>
					</div>
				{:else}
					<div class="-my-2 grid grid-cols-3 gap-3">
						<button class="btn btn-ghost" on:click={() => (deleting = true)}>
							Delete
						</button>
						<button class="btn btn-ghost" on:click={() => (renaming = true)}>
							Rename
						</button>
						<button class="btn btn-ghost" on:click={copyLink}> Share </button>
					</div>
					<div class="divider my-2" />
					<div class="rounded-lg bg-base-200 p-2">
						<p class="pl-2 text-base-content/60">call this car during grace trains!</p>
						<ol>
							{#each [data.car.name, data.car.shortId] as identifier}
								<li class="my-1">
									<button
										on:click={() => copyGraceMessage(identifier)}
										class="btn btn-ghost btn-xs block h-auto max-h-none text-left text-base font-normal normal-case"
									>
										<strong class="text-primary">{data.car.twitchName}</strong>: GRACE
										<strong>{identifier}</strong>
									</button>
								</li>
							{/each}
						</ol>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>
{#if data.user}
	<!-- Users not logged in have no page to go "back" to -->
	<!-- TODO: Add a "design your own car!" button -->
	<div class="mb-4 flex justify-center">
		<a href="/" class="btn btn-lg">Home</a>
	</div>
{/if}
<div class="toast toast-center toast-top">
	{#if toastMessage !== null}
		<div
			class="alert alert-info grid-flow-col"
			out:fade={{ duration: 200, easing: cubicIn }}
		>
			<!-- TODO: Move to Icon.svelte -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="size-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/></svg
			>
			<span>{toastMessage}</span>
		</div>
	{/if}
</div>
